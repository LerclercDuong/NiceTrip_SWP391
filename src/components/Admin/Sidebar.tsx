import * as React from 'react';
import GlobalStyles from '@mui/joy/GlobalStyles';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import LinearProgress from '@mui/joy/LinearProgress';
import List from '@mui/joy/List';
import HomeIcon from '@mui/icons-material/Home';
import ListItemButton, { listItemButtonClasses } from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import QuestionAnswerRoundedIcon from '@mui/icons-material/QuestionAnswerRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import SupportRoundedIcon from '@mui/icons-material/SupportRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import LuggageIcon from '@mui/icons-material/Luggage';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ColorSchemeToggle from './ColorSchemeToggle';
import { NavLink, useNavigate } from 'react-router-dom';
import { closeSidebar } from '../utils';
import { Logout } from '../../features/auth/auth.slice';
import {
  createSessionCookies,
  getRefreshToken,
  getToken,
  removeSessionCookies
} from '../../utils/tokenCookies'
import { useSelector, useDispatch } from 'react-redux'
import {
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/joy';
import { Link } from 'react-router-dom';

function getRoleColor(role: any) {
  switch (role) {
    case 'member-basic':
      return '#A9A9A9';
    case 'member-protected':
      return '#2F4F4F';
    case 'member-fullservice':
      return '#FF4500';
    default:
      return 'inherit';
  }
}

function Toggler({
  defaultExpanded = false,
  renderToggle,
  children,
}: {
  defaultExpanded?: boolean;
  children: React.ReactNode;
  renderToggle: (params: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultExpanded);
  return (
    <React.Fragment>
      {renderToggle({ open, setOpen })}
      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: '0.2s ease',
          '& > *': {
            overflow: 'hidden',
          },
        }}
      >
        {children}
      </Box>
    </React.Fragment>
  );
}
interface RootState {
  auth: {
    isAuthenticated: boolean;
    user: any;
  };
}
export default function Sidebar() {
  const user = useSelector((state: RootState) => state?.auth?.user);
  const dispatch = useDispatch()
  const navigate = useNavigate()

  function handleLogout(){
    dispatch(Logout());
    removeSessionCookies();
    window.location.reload()
  }
  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: { xs: 'fixed', md: 'sticky' },
        transform: {
          xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
          md: 'none',
        },
        transition: 'transform 0.4s, width 0.4s',
        zIndex: 10000,
        height: '100dvh',
        width: 'var(--Sidebar-width)',
        top: 0,
        p: 2,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ':root': {
            '--Sidebar-width': '220px',
            [theme.breakpoints.up('lg')]: {
              '--Sidebar-width': '240px',
            },
          },
        })}
      />
      <Box
        className="Sidebar-overlay"
        sx={{
          position: 'fixed',
          zIndex: 9998,
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          opacity: 'var(--SideNavigation-slideIn)',
          backgroundColor: 'var(--joy-palette-background-backdrop)',
          transition: 'opacity 0.4s',
          transform: {
            xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))',
            lg: 'translateX(-100%)',
          },
        }}
        onClick={() => closeSidebar()}
      />
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }} >
        <IconButton variant="soft" color="primary" size="sm" onClick={()=>{navigate('/home')}} sx={{color: '#ff6f03'}}>
          <HomeIcon />
        </IconButton>
        <Typography level="title-lg">Nice trip</Typography>
        <ColorSchemeToggle sx={{ ml: 'auto' }} />
      </Box>
      <Input size="sm" startDecorator={<SearchRoundedIcon />} placeholder="Search" />
      <Box
        sx={{
          minHeight: 0,
          overflow: 'hidden auto',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5,
          },
        }}
      >
        <List
          size="sm"
          sx={{
            gap: 1,
            '--List-nestedInsetStart': '30px',
            '--ListItem-radius': (theme) => theme.vars.radius.sm,
          }}
        >


          {/* <NavLink to="/me/dashboard" style={{ textDecoration: 'none' }}>
            <ListItemButton>
              <DashboardRoundedIcon />
              <ListItemContent>
                <Typography level="title-sm">Dashboard</Typography>
              </ListItemContent>
            </ListItemButton>
          </NavLink> */}

          <NavLink to="/admin/account-list" style={{ textDecoration: 'none' }}>
            <ListItemButton>
              <GroupRoundedIcon />
              <ListItemContent>
                <Typography level="title-sm">Account management</Typography>
              </ListItemContent>
            </ListItemButton>
          </NavLink>

          

          <NavLink to="/admin/request-list" style={{ textDecoration: 'none' }} >
            <ListItemButton>
              <ShoppingCartRoundedIcon />
              <ListItemContent>
                <Typography level="title-sm">Request management</Typography>
              </ListItemContent>
            </ListItemButton>
          </NavLink>

          <NavLink to="/admin/resort-list" style={{ textDecoration: 'none' }}>
            <ListItemButton>
              <LuggageIcon />
              <ListItemContent>
                <Typography level="title-sm">Resort management</Typography>
              </ListItemContent>
            </ListItemButton>
          </NavLink>

          <NavLink to="/admin/resort-list" style={{ textDecoration: 'none' }}>
            <ListItemButton>
              <LuggageIcon />
              <ListItemContent>
                <Typography level="title-sm">Report balance</Typography>
              </ListItemContent>
            </ListItemButton>
          </NavLink>

        </List>
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Avatar
          variant="outlined"
          size="sm"
          src={user?.profilePicture}
        />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography level="title-sm">{user?.username}</Typography>
          <Typography level="body-xs">{user?.email}</Typography>
        </Box>
        <IconButton size="sm" variant="plain" color="neutral" onClick={handleLogout}>
          <LogoutRoundedIcon />
        </IconButton>
      </Box>
    </Sheet>
  );
}
