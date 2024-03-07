/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import {ColorPaletteProp} from '@mui/joy/styles';
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
import IconButton, {iconButtonClasses} from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';
import ImageGallery from "react-image-gallery";
import {convertDate} from '../../utils/date'

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockIcon from '@mui/icons-material/Block';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import {GetExchangeRequestOfTimeshare} from "../../services/booking.service";
import { Transition } from 'react-transition-group';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import {AcceptExchangeByOwner} from "../../services/booking.service";
import {CancelExchangeByOwner} from "../../services/booking.service";
import { useState } from "react";
import axios from 'axios';
import {useEffect } from 'react';
import convertImageArray from '../../utils/convertImageArray'
import { Height } from '@mui/icons-material';

interface ServicePack {
    _id: string;
    name: string;
    amount: number;
    numberPosts: number | null;
  }

interface Timeshare {
    type: 'rental' | 'exchange';
    start_date: Date;
    end_date: Date;
    current_owner: string;
    resortId: string;
    unitId: string;
    numberOfNights: number;
    price: string;
    pricePerNight: string;
    images: Array<string>; // Assuming the array contains paths to images
    is_bookable?: boolean;
    is_verified?: boolean;
    timestamp?: Date;
}

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
function formatDate(dateString?: string): string {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}


function RowMenu(props: any) {
    const reservationData = props.reservationData; // Assuming you pass the reservation data to the component
    const [open, setOpen] = React.useState<boolean>(false);

    return (
        <>
            <Dropdown>
                <MenuButton
                    slots={{ root: IconButton }}
                    slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'sm' } }}
                >
                    <MoreHorizRoundedIcon />
                </MenuButton>
                <Menu size="sm" sx={{ minWidth: 140 }}>
                    <MenuItem onClick={() => setOpen(true)}>View detail</MenuItem>
                    <MenuItem>Edit</MenuItem>
                    <Divider />
                    <MenuItem color="danger">Delete</MenuItem>
                </Menu>
            </Dropdown>
            <Transition in={open} timeout={400}>
                {(state: string) => (
                    <Modal
                        keepMounted
                        open={!['exited', 'exiting'].includes(state)}
                        onClose={() => setOpen(false)}
                        slotProps={{
                            backdrop: {
                                sx: {
                                    opacity: 0,
                                    backdropFilter: 'none',
                                    transition: `opacity 400ms, backdrop-filter 400ms`,
                                    ...(state === 'entering' || state === 'entered'
                                        ? { opacity: 1, backdropFilter: 'blur(8px)' }
                                        : {}),
                                },
                            },
                        }}
                        sx={{
                            visibility: state === 'exited' ? 'hidden' : 'visible',
                        }}
                    >
                        <ModalDialog
                            sx={{
                                opacity: 0,
                                transition: `opacity 300ms`,
                                ...(state === 'entering' || state === 'entered'
                                    ? { opacity: 1 }
                                    : {}),
                            }}
                        >
                            <DialogTitle>Reservation Details</DialogTitle>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', maxWidth: 600 }}>
                                <Avatar size="sm" src={reservationData?.userId?.profilePicture} sx={{ width: 32, height: 32 }}>
                                    {reservationData?.userId?.firstname?.charAt(0)}
                                </Avatar>
                                <div>
                                    <Typography level="body-xs">{reservationData?.userId?.firstname} {reservationData?.userId?.lastname}</Typography>
                                    <Typography level="body-xs">{reservationData?.userId?.email}</Typography>
                                </div>
                            </Box>
                            <Box sx={{ marginLeft: 2 }}>
                                <h2>{reservationData?.myTimeshareId?.resortId.name}</h2>
                                <span>
                                    <h5>{reservationData?.myTimeshareId?.unitId?.name}</h5>
                                </span>
                                <span>
                                    <h6>Number of Nights: {reservationData?.myTimeshareId?.numberOfNights}</h6>
                                </span>
                            </Box>
                            <DialogContent>

                                <div>
                                    <strong>Address:</strong> {reservationData?.address?.street},{' '}
                                    {reservationData?.address?.city}, {reservationData?.address?.province},{' '}
                                    {reservationData?.address?.zipCode}, {reservationData?.address?.country}
                                </div>
                                <div>
                                    <strong>Amount:</strong> {reservationData?.amount}
                                </div>
                                <div>
                                    <strong>Email:</strong> {reservationData?.email}
                                </div>
                                <div>
                                    <strong>Full Name:</strong> {reservationData?.fullName}
                                </div>
                                <div>
                                    <strong>Phone:</strong> {reservationData?.phone}
                                </div>
                                <div>
                                    <strong>Reservation Date:</strong> {formatDate(reservationData?.request_at)}
                                </div>
                                <div>
                                    <strong>Status:</strong> {reservationData?.status}
                                </div>

                            </DialogContent>
                        </ModalDialog>
                    </Modal>
                )}
            </Transition>
        </>
    );
}


export default function RentRequestList(props: any) {
    const reservationData = props.reservationData; // Assuming you pass the reservation data to the component
    const [requestList, setRequestList] = React.useState<any[]>([]);
    const [servicePacks, setServicePacks] = useState<ServicePack[]>([]);
    const [timeshares, setTimeshares] = useState<Timeshare[]>([]);
    useEffect(() => {
        const fetchTimeshares = async () => {
            try {
                const timesharePromises = requestList.map(async (row) => {

                    const response = await axios.get<Timeshare[]>(`http://localhost:8080/api/v2/timeshare/${row?.myTimeshareId}`);

                    const timeshareData = await Promise.all(timesharePromises);
                    return response.data;
                });
                const timeshareData = await Promise.all(timesharePromises);
                setTimeshares(timeshareData.flat()); // Flatten the array of arrays
            
            } catch (error) {
                console.error('Error fetching service packs:', error);
            }
        };
        fetchTimeshares();
    }, []);

    // useEffect(() => {
    //     const fetchServicePacks = async () => {
    //         try {
    //             const response = await axios.get<ServicePack[]>('http://localhost:8080/api/v2/servicePack/getAllServicePack');
    //             setServicePacks(response.data);
    //         } catch (error) {
    //             console.error('Error fetching service packs:', error);
    //         }
    //     };
  
    //     fetchServicePacks();
    // }, []);
    
    const [openModal, setOpenModal] = React.useState(false);
    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };
    const timeshareId = props?.timeshareId;
    async function Load() {
        try {
            // Fetch rent requests based on timeshareId
            const response = await GetExchangeRequestOfTimeshare(timeshareId);
            if (response) {
                setRequestList(response);
            }
        } catch (error: any) {
            console.error('Error fetching rent requests:', error.message);
        }
    }

    React.useEffect(() => {
        // Load rent requests when timeshareId changes
        Load();
    }, [timeshareId]);

    const [order, setOrder] = React.useState<Order>('desc');
    const [selected, setSelected] = React.useState<readonly string[]>([]);
    const [open, setOpen] = React.useState(false);
    return (

        <Sheet
            className="OrderTableContainer"
            // variant="outlined"
            sx={{
                display: {xs: 'none', sm: 'initial'},
                width: '100%',
                borderRadius: 'sm',
                flexShrink: 1,
                overflow: 'auto',
                minHeight: 1,
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
                    <th style={{width: 140, padding: '12px 6px'}}>Date</th>
                    <th style={{width: 140, padding: '12px 6px'}}>Paid</th>
                    <th style={{width: 240, padding: '12px 6px'}}>Customer</th>
                    <th style={{width: 240, padding: '12px 6px'}}>View detail</th>
                    <th style={{width: 240, padding: '12px 6px'}}>Status</th>
                    <th style={{width: 100, padding: '12px 6px'}}></th>
                </tr>
                </thead>
                <tbody>
                {requestList?.map((row: any) => {
                    return (
                        <tr key={row._id}>
                            <td>
                                <Typography level="body-xs">{formatDate(row?.request_at)}</Typography>
                            </td>
                            <td>
                                {/* Display status or Chip based on your logic */}
                                {row?.isPaid ? (
                                    <Chip variant="soft" size="sm" startDecorator={<CheckRoundedIcon />} color="success">
                                        Paid
                                    </Chip>
                                ) : (
                                    <Chip variant="soft" size="sm" color="danger">
                                        Not paid
                                    </Chip>
                                )}
                            </td>
                            <td>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Avatar size="sm" src={row?.userId?.profilePicture}>{row?.userId?.firstname?.charAt(0)}</Avatar>
                                    <div>
                                        <Typography level="body-xs">{row?.userId?.firstname} {row?.userId?.lastname}</Typography>
                                        <Typography level="body-xs">{row?.userId?.email}</Typography>
                                    </div>
                                </Box>
                            </td>
                            <td>
                            
                            <React.Fragment>
                            <Button variant="outlined" color="neutral" onClick={() => setOpen(true)}>
                                View detail
                            </Button>
                            
                            
                            <Modal
                                aria-labelledby="modal-title"
                                aria-describedby="modal-desc"
                                open={open}
                                onClose={() => setOpen(false)}
                                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            >
                                <Sheet
                                variant="outlined"
                                sx={{
                                    maxWidth: 600,
                                    borderRadius: 'md',
                                    p: 3,
                                    boxShadow: 'lg',
                                }}
                                >
                                <ModalClose variant="plain" sx={{ m: -1 }} />
                                <Typography
                                    component="h2"
                                    id="modal-title"
                                    level="h4"
                                    textColor="inherit"
                                    fontWeight="lg"
                                    mb={1}
                                >

                                </Typography>
                            <ImageGallery items={convertImageArray([...row?.myTimeshareId?.images, ...row?.myTimeshareId?.resortId.image_urls])}/>
                            <h2>{row?.myTimeshareId?.resortId.name}</h2>
                                    <span>
                                        <h5>{row?.myTimeshareId?.unitId?.name}</h5>
                                    </span>

                                <span>
                                        <h6>Number of Nights: {row?.myTimeshareId?.numberOfNights}</h6>
                                </span>
                            <Typography> 
                                <div className='tour__extra-details'>
                                    <span>
                                        <i className="ri-map-pin-range-line"></i>{row?.myTimeshareId?.resortId.location}
                                    </span>
                                    <span>
                                        <i className="ri-money-dollar-circle-line"></i>{row?.myTimeshareId?.price}
                                    </span>
                                    <span>
                                        <i className="ri-time-line"></i> {convertDate(row?.myTimeshareId?.start_date)} - {convertDate(row?.myTimeshareId?.end_date)}
                                    </span>
                                </div>
                            
                            </Typography>

                            <td> 
                                <Typography level="body-xs">
                                    {row?.timeshareId?.is_bookable === false ? (
                                        <Box sx={{ fontSize:'15px', border: '1px' , backgroundColor:'gray', color:'white', padding:'10px', borderRadius:'5px'}}>
                                            Accepted
                                        </Box>                                     
                                    ) : (
                                        <>
                                            <Button variant="solid" color="success" onClick={() => {
                                                AcceptExchangeByOwner(row?._id);
                                                setOpen(false);
                                            }}>
                                                Accept
                                            </Button>
                                            <Button variant="solid" color="danger"  onClick={() => {
                                                CancelExchangeByOwner(row?._id);
                                                setOpen(false);
                                            }}>
                                                Cancel
                                            </Button>
                                        </>
                                    )}
                                </Typography>
                            </td>


                                </Sheet>
                            </Modal>
                            
                          
      
                            </React.Fragment>

                            </td>
                            <td>
                                <Typography level="body-xs">{row?.status}</Typography>
                            </td>
                            <td>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Link level="body-xs" component="button">
                                        Contact
                                    </Link>
                                    <RowMenu reservationData={row}/>
                                </Box>
                                
                            </td>
                        </tr>
                        
                    );
                    
                })}
                </tbody>
            </Table>
        </Sheet>
    );
    
}