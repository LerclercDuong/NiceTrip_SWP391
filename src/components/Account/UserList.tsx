import * as React from 'react';
import { ColorPaletteProp } from '@mui/joy/styles';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Link from '@mui/joy/Link';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Checkbox from '@mui/joy/Checkbox';
import IconButton, { iconButtonClasses } from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import BlockIcon from '@mui/icons-material/Block';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import { BanUser, GetAllAccount, UnbanUser } from '../../services/admin.services';
import { useParams } from 'react-router-dom';
import { convertDateTime } from '../../utils/date';
import { AspectRatio, CardActions, CardOverflow, DialogActions, DialogContent, DialogTitle, FormHelperText } from '@mui/joy';
import { useSnackbar } from 'notistack';
import { InfoOutlined } from '@mui/icons-material';
import * as yup from "yup";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { UpdateUser } from '../../services/auth.service';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function RowMenu({ user, setOpenBan, setOpenUnban, setOpenEdit, setUserModal }: any) {
  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'sm' } }}
      >
        <MoreHorizRoundedIcon />
      </MenuButton>
      <Menu size="sm" sx={{ minWidth: 140 }}>
        <MenuItem onClick={() => {
          setUserModal(user);
          setOpenEdit(true)
        }}>Edit</MenuItem>
        <Divider />
        {!user.isBanned ? (
          <MenuItem color="danger" onClick={() => {
            setUserModal(user);
            setOpenBan(true);
          }}>Ban</MenuItem>
        ) : (
          <MenuItem color="warning" onClick={() => {
            setUserModal(user);
            setOpenUnban(true);
          }}>Unban</MenuItem>
        )}
      </Menu>
    </Dropdown>
  );
}

const userEditSchema = yup.object().shape({
  firstname: yup.string()
    .required("First Name is required!")
    .matches(/^[a-zA-Z]+$/, 'Field cannot have numeric or special characters'),
  lastname: yup.string()
    .required("Last Name is required!")
    .matches(/^[a-zA-Z]+$/, 'Field cannot have numeric or special characters'),
  email: yup.string()
    .required("Email is required!")
    .matches(/^[^\.\s][\w\-\.{2,}]+@([\w-]+\.)+[\w-]{2,}$/, "Email is invalid!"),
  phone: yup.string()
    .matches(/^0\d{9}$/, "Invalid phone number")
})

export default function UserList() {
  const [page, setPage] = React.useState(1);
  const [role, setRole] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [searchTemp, setSearchTemp] = React.useState('');
  const [totalPage, setTotalPage] = React.useState(1);
  const [users, setUsers] = React.useState([]);
  const [order, setOrder] = React.useState<Order>('desc');
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [open, setOpen] = React.useState(false);
  const [openBan, setOpenBan] = React.useState(false);
  const [openUnban, setOpenUnban] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [banUploading, setbanUploading] = React.useState(false);
  const [unbanUploading, setUnbanUploading] = React.useState(false);
  const [editUploading, setEditUploading] = React.useState(false);
  const [userModal, setUserModal] = React.useState<any>(null);
  const [roleSelect, setRoleSelect] = React.useState(null);
  const {
    register: registerUserEdit,
    handleSubmit: handleUserEditSubmit,
    formState: { errors: userEditErrors }
  } = useForm({
    resolver: yupResolver(userEditSchema),
  })
  const { pageString } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  async function getAllAccounts() {
    const data = await GetAllAccount(search, page, role);
    if (data && data.results) {
      console.log(data);
      setUsers(data.results);
      if (data.totalPages > 0) {
        setTotalPage(data.totalPages);
      }
    }
  }
  const handleSearch = (e: any) => {
    e.preventDefault()
    console.log(searchTemp);
    setSearch(searchTemp);
  }
  const banUser = async (userId: string) => {
    try {
      await BanUser(userId);
      enqueueSnackbar(`Ban user successfully`, { variant: "success" });
      setOpenBan(false);
    }
    catch (error: any) {
      enqueueSnackbar(`Error: ${error?.message}`, { variant: "error" });
    }
  }
  const unbanUser = async (userId: string) => {
    try {
      await UnbanUser(userId);
      enqueueSnackbar(`Unban user successfully`, { variant: "success" });
      setOpenUnban(false);
    }
    catch (error: any) {
      enqueueSnackbar(`Error: ${error?.message}`, { variant: "error" });
    }
  }
  const handleUserEdit = async (userId: string, event: any) => {
    try {
      const data = {
        firstname: userModal.firstname,
        lastname: userModal.lastname,
        email: userModal.email,
        phone: userModal.phone,
        role: (roleSelect ? roleSelect : userModal.role)
      }
      const result = await UpdateUser(userId, data);
      if (result) {
        enqueueSnackbar("Updated successully", { variant: "success" });
        setOpenEdit(false);
        setUserModal(null);
      }
    }
    catch (error: any) {
      enqueueSnackbar(`Error while updating information: ${error.response.data.message}`, { variant: "error" });
    }
  }
  React.useEffect(() => {
    getAllAccounts();
  }, [page, role, search])
  React.useEffect(() => {
    if (pageString && parseInt(pageString) > 0) {
      setPage(parseInt(pageString));
    }
  }, []);
  React.useEffect(() => {
    console.log(userModal)
  }, [userModal])

  const renderFilters = () => (
    <React.Fragment>
      <FormControl size="sm">
        <FormLabel>Status</FormLabel>
        <Select
          size="sm"
          placeholder="Filter by status"
          slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
        >
          <Option value="paid">Active</Option>
          <Option value="pending">Banned</Option>
          <Option value="refunded">Deleted</Option>
        </Select>
      </FormControl>
      <FormControl size="sm">
        <FormLabel>Role</FormLabel>
        <Select size="sm" placeholder="All">
          <Option value="admin" onClick={() => setRole("admin")}>Admin</Option>
          <Option value="user" onClick={() => setRole("user")}>User</Option>
        </Select>
      </FormControl>
      <FormControl size="sm">
        <FormLabel>Sort by</FormLabel>
        <Select size="sm" placeholder="All">
          <Option value="all">Username</Option>
          <Option value="olivia">Date created</Option>
        </Select>
      </FormControl>
    </React.Fragment>
  );
  return (
    <React.Fragment>
      <Sheet
        className="SearchAndFilters-mobile"
        sx={{
          display: { xs: 'flex', sm: 'none' },
          my: 1,
          gap: 1,
        }}
      >
        <Input
          size="sm"
          placeholder="Search"
          startDecorator={<SearchIcon />}
          sx={{ flexGrow: 1 }}
        />
        <IconButton
          size="sm"
          variant="outlined"
          color="neutral"
          onClick={() => setOpen(true)}
        >
          <FilterAltIcon />
        </IconButton>
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalDialog aria-labelledby="filter-modal" layout="fullscreen">
            <ModalClose />
            <Typography id="filter-modal" level="h2">
              Filters
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Sheet sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {renderFilters()}
              <Button color="primary" onClick={() => setOpen(false)}>
                Submit
              </Button>
            </Sheet>
          </ModalDialog>
        </Modal>
      </Sheet>
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          borderRadius: 'sm',
          py: 2,
          display: { xs: 'none', sm: 'flex' },
          flexWrap: 'wrap',
          gap: 1.5,
          '& > *': {
            minWidth: { xs: '120px', md: '160px' },
          },
        }}
      >
        <form onSubmit={handleSearch}>
          <FormControl sx={{ flex: 1 }} size="sm">
            <FormLabel>Search for user</FormLabel>
            <Input size="sm"
              placeholder="Search"
              startDecorator={<SearchIcon />}
              value={searchTemp}
              onChange={(e) => {
                setSearchTemp(e.target.value)
              }} />
          </FormControl>
        </form>
        {renderFilters()}
      </Box>
      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: { xs: 'none', sm: 'initial' },
          width: '100%',
          borderRadius: 'sm',
          flexShrink: 1,
          overflow: 'auto',
          minHeight: 0,
        }}
      >
        <Table
          aria-labelledby="tableTitle"
          stickyHeader
          hoverRow
          sx={{
            '--TableCell-headBackground': 'var(--joy-palette-background-level1)',
            '--Table-headerUnderlineThickness': '1px',
            '--TableRow-hoverBackground': 'var(--joy-palette-background-level1)',
            '--TableCell-paddingY': '4px',
            '--TableCell-paddingX': '8px',
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 48, textAlign: 'center', padding: '12px 6px' }}>
                <Checkbox
                  size="sm"
                  indeterminate={
                    selected.length > 0 && selected.length !== users.length
                  }
                  checked={selected.length === users.length}
                  onChange={(event) => {
                    setSelected(
                      event.target.checked ? users.map((row: any) => row._id) : [],
                    );
                  }}
                  color={
                    selected.length > 0 || selected.length === users.length
                      ? 'primary'
                      : undefined
                  }
                  sx={{ verticalAlign: 'text-bottom' }}
                />
              </th>
              <th style={{ width: 240, padding: '12px 12px' }}>User</th>
              <th style={{ width: 140, padding: '12px 6px' }}>Role</th>
              <th style={{ width: 140, padding: '12px 6px' }}>Date Joined</th>
              <th style={{ width: 140, padding: '12px 6px' }}>Status</th>
              <th style={{ width: 140, padding: '12px 6px' }}> </th>
            </tr>
          </thead>
          <tbody>
            {stableSort(users, getComparator(order, '_id')).map((user: any) => (
              <tr key={user._id}>
                <td style={{ textAlign: 'center', width: 120 }}>
                  <Checkbox
                    size="sm"
                    checked={selected.includes(user._id)}
                    color={selected.includes(user._id) ? 'primary' : undefined}
                    onChange={(event) => {
                      setSelected((ids) =>
                        event.target.checked
                          ? ids.concat(user._id)
                          : ids.filter((itemId) => itemId !== user._id),
                      );
                    }}
                    slotProps={{ checkbox: { sx: { textAlign: 'left' } } }}
                    sx={{ verticalAlign: 'text-bottom' }}
                  />
                </td>
                <td>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar size="sm" src={user.profilePicture} alt={user.username} />
                    <div>
                      <Typography level="body-xs">{user.username}</Typography>
                      <Typography level="body-xs">{user.email}</Typography>
                    </div>
                  </Box>
                </td>
                <td>
                  <Typography level="body-xs">{user.role}</Typography>
                </td>
                <td>
                  <Typography level="body-xs">{convertDateTime(user.timestamp)}</Typography>
                </td>
                <td>
                  {user.isBanned ? (
                    <Chip
                      variant="soft"
                      size="sm"
                      startDecorator={<BlockIcon />}
                      color="danger"
                    >
                      Banned
                    </Chip>
                  ) : (
                    <Chip
                      variant="soft"
                      size="sm"
                      startDecorator={<CheckRoundedIcon />}
                      color="success"
                    >
                      Active
                    </Chip>
                  )}
                </td>
                <td>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Link level="body-xs" component="button">
                      Download
                    </Link>
                    <RowMenu
                      user={user}
                      setOpenBan={setOpenBan}
                      setOpenUnban={setOpenUnban}
                      setOpenEdit={setOpenEdit}
                      setUserModal={setUserModal}
                    />
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Modal open={openBan} onClose={() => setOpenBan(false)}>
          <ModalDialog variant="outlined" role="alertdialog">
            <DialogTitle>
              <WarningRoundedIcon />
              Confirmation
            </DialogTitle>
            <Divider />
            <DialogContent>
              Are you sure you want to ban {userModal?.username}?
            </DialogContent>
            <DialogActions>
              <Button variant="solid" color="danger" onClick={() => banUser(userModal?._id)}>
                Yes
              </Button>
              <Button variant="plain" color="neutral" onClick={() => setOpenBan(false)}>
                No
              </Button>
            </DialogActions>
          </ModalDialog>
        </Modal>
        <Modal open={openUnban} onClose={() => setOpenUnban(false)}>
          <ModalDialog variant="outlined" role="alertdialog">
            <DialogTitle>
              <WarningRoundedIcon />
              Confirmation
            </DialogTitle>
            <Divider />
            <DialogContent>
              Are you sure you want to unban {userModal?.username}?
            </DialogContent>
            <DialogActions>
              <Button variant="solid" color="warning" onClick={() => unbanUser(userModal?._id)}>
                Yes
              </Button>
              <Button variant="plain" color="neutral" onClick={() => setOpenUnban(false)}>
                No
              </Button>
            </DialogActions>
          </ModalDialog>
        </Modal>
        <Modal open={openEdit} onClose={() => {
          setOpenEdit(false)
          setUserModal(null)
        }}>
          {userModal && (
          <ModalDialog variant="outlined" role="alertdialog">
            <DialogTitle>
              <WarningRoundedIcon />
              Edit user
            </DialogTitle>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Avatar
                variant="outlined"
                size="sm"
                src={userModal?.profilePicture}
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography level="title-sm">{userModal?.username}</Typography>
                <Typography level="body-xs">{userModal?.email}</Typography>
              </Box>
            </Box>
            <Divider />
            <form onSubmit={handleUserEditSubmit((e: any) => { handleUserEdit(userModal?._id, e) })}>
              <FormControl disabled error={!!userEditErrors.firstname}>
                <FormLabel>First name</FormLabel>
                <Input
                  size="sm"
                  placeholder="First name"
                  defaultValue={userModal.firstname}
                />
                {userEditErrors.firstname &&
                  <FormHelperText>
                    <InfoOutlined />
                    {userEditErrors.firstname.message}
                  </FormHelperText>
                }
              </FormControl>
              <FormControl disabled error={!!userEditErrors.lastname}>
                <FormLabel sx={{ mt: 2 }}>Last name</FormLabel>
                <Input
                  size="sm"
                  placeholder="Last name"
                  defaultValue={userModal.lastname}
                  sx={{ flexGrow: 1 }}
                />
                {userEditErrors.lastname &&
                  <FormHelperText>
                    <InfoOutlined />
                    {userEditErrors.lastname.message}
                  </FormHelperText>
                }
              </FormControl>
              <FormControl disabled error={!!userEditErrors.email}>
                <FormLabel sx={{ mt: 2 }}>Email</FormLabel>
                <Input
                  size="sm"
                  type="email"
                  startDecorator={<EmailRoundedIcon />}
                  placeholder="email"
                  key={`email:${userModal.email}`}
                  defaultValue={userModal.email}
                  sx={{ flexGrow: 1 }}
                />
                {userEditErrors.email &&
                  <FormHelperText>
                    <InfoOutlined />
                    {userEditErrors.email.message}
                  </FormHelperText>
                }
              </FormControl>
              <FormControl disabled error={!!userEditErrors.firstname}>
                <FormLabel sx={{ mt: 2 }}>Phone</FormLabel>
                <Input
                  size="sm"
                  placeholder="Phone"
                  defaultValue={userModal.phone}
                  sx={{ flexGrow: 1 }}
                />
                {userEditErrors.phone &&
                  <FormHelperText>
                    <InfoOutlined />
                    {userEditErrors.phone.message}
                  </FormHelperText>
                }
              </FormControl>
              <FormControl>
                <FormLabel sx={{ mt: 2 }}>Role</FormLabel>
                <Select defaultValue={userModal.role} onChange={(event: any, newValue: any) => setRoleSelect(newValue)}>
                  <Option value="admin">Admin</Option>
                  <Option value="user">User</Option>
                </Select>
              </FormControl>
              <CardOverflow sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 2 }}>
                <CardActions sx={{ alignSelf: 'flex-end', pt: 2 }}>
                <Button 
                  size="sm" 
                  variant="outlined" 
                  color="neutral"
                  onClick={() => setOpenEdit(false)}>
                    Cancel
                </Button>
                <Button loading={editUploading} size="sm" variant="solid" type='submit'>Save</Button>
                </CardActions>
              </CardOverflow>
            </form>
          </ModalDialog>
          )}
        </Modal>
      </Sheet>
      <Box
        className="Pagination-laptopUp"
        sx={{
          pt: 2,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: '50%' },
          display: {
            xs: 'none',
            md: 'flex',
          },
        }}
      >
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          startDecorator={<KeyboardArrowLeftIcon />}
        >
          Previous
        </Button>

        <Box sx={{ flex: 1 }} />
          <Typography>Page {page} of {totalPage}</Typography>
        <Box sx={{ flex: 1 }} />

        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          disabled={page >= totalPage}
          onClick={() => setPage(page + 1)}
          endDecorator={<KeyboardArrowRightIcon />}
        >
          Next
        </Button>
      </Box>
    </React.Fragment>
  );
}