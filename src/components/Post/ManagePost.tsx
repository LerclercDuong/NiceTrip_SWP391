import * as React from 'react';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Link from '@mui/joy/Link';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import BookmarkAdd from '@mui/icons-material/BookmarkAddOutlined';
import { styled, Grid } from '@mui/joy';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import { GetPostBelongToOwner, GetPostById } from '../../services/post.service';
import { useSelector } from 'react-redux';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import Stack from '@mui/joy/Stack';
import Chip from '@mui/joy/Chip';
import { GetReservationOfPost, ConfirmReservation } from '../../services/booking.service';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
interface RootState {
    auth: {
        isAuthenticated: boolean;
        user: any;
    };
}

export default function ManagePost() {
    const user = useSelector((state: RootState) => state?.auth?.user);
    const [post, setPost] = React.useState<any>([]);
    const [reservationList, setReservationList] = React.useState<any>([]);
    let { postId } = useParams();
    const navigate = useNavigate()

    React.useEffect(() => {
        Load()
    }, [])

    async function Load() {
        if (postId) {
            const postData = await GetPostById(postId);
            const reservationData = await GetReservationOfPost(postId);
            if (postData) {
                setPost(postData)
            }
            if (reservationData) {
                setReservationList(reservationData)
            }
        }
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

    async function handleConfirmReservation(reservationId: string) {
        const response = await ConfirmReservation(reservationId);
        console.log(response);
        if(response?.code === 200) window.location.reload();
    }
    return (
        <Grid container spacing={1} sx={{ flexGrow: 1, mx: { xs: 2, md: 6 }, mt: 2, flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: 1 }}>

            <Grid xs={12} md={8} sx={{ p: 1, boxShadow: '0 0 2px gray' }}>
                <Box sx={{ flexGrow: 1, width: 1 }}>
                    <Typography fontWeight={400} fontSize={14}>
                        <b>Post id:</b> {post?._id}
                    </Typography>
                    <Typography color="primary" fontWeight={500} fontSize={30}>
                        {post?.resortId?.name}
                    </Typography>
                    <Typography fontWeight={500} fontSize={16}>
                        {post?.resortId?.location}
                    </Typography>
                    <AspectRatio maxHeight={360} sx={{ mt: 1 }} >
                        <img
                            src={post?.resortId?.image_urls}
                            alt="A beautiful landscape."
                        />
                    </AspectRatio>

                    <Box>
                        <Typography fontWeight={600} fontSize={22} sx={{ mt: 2 }}>
                            {/* <strong>Unit</strong> */}
                        </Typography>
                        <Card variant="outlined"
                            orientation="horizontal" sx={{ display: 'flex', width: 1 }}  >
                            <img src={post?.unitId?.image_urls}
                                style={{ width: '200px', height: 'auto' }} />
                            <Box>
                                <Typography fontWeight={700} fontSize={26}>
                                    {post?.unitId?.name}
                                </Typography>
                                <Typography fontWeight={400} fontSize={18}>
                                    {post?.unitId?.details}
                                </Typography>
                            </Box>

                        </Card>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <Typography fontWeight={600} fontSize={22}>
                            <strong>Description</strong>
                        </Typography>
                        <Typography fontWeight={400} fontSize={16}>
                            <p>{post?.resortId?.description}</p>
                        </Typography>
                    </Box>
                    <Box>
                        <Typography fontWeight={600} fontSize={22}>
                            <strong>Feature</strong>
                        </Typography>
                        <Typography fontWeight={400} fontSize={16}>
                            <p>{post?.resortId?.nearby_attractions + ", "} </p>
                        </Typography>
                    </Box>
                    <Box>
                        <Typography fontWeight={600} fontSize={22}>
                            <strong>Facilities</strong>
                        </Typography>
                        <Typography fontWeight={400} fontSize={16}>
                            <p>{post?.resortId?.facilities + ", "}</p>
                        </Typography>
                    </Box>
                    <Box>
                        <Typography fontWeight={600} fontSize={22}>
                            <strong>Additional image</strong>
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{
                            display: 'flex',
                            gap: 1,
                            py: 1,
                            overflow: 'auto',
                            width: 1,
                            scrollSnapType: 'x mandatory',
                            '& > *': {
                                scrollSnapAlign: 'center',
                            },
                            '::-webkit-scrollbar': { display: 'none' },
                        }}>
                            {(post?.images || []).map((imageUrl: string, index: number) => (
                                <AspectRatio ratio="1" sx={{ minWidth: 120 }}>
                                    <img
                                        key={index} // Add a unique key for each image
                                        src={imageUrl}
                                        alt={`Image ${index + 1}`}
                                        style={{ width: '200px', height: 'auto' }} // Adjust the style as needed
                                    />
                                </AspectRatio>
                            ))}
                        </Stack>

                    </Box>
                </Box>
            </Grid>
            <Grid xs={12} md={4} sx={{ p: 0, height: 'fit-content' }}>
                <Stack sx={{ width: 1, display: 'flex', justifyContent: 'center', textAlign: 'center', boxShadow: '0 0 2px gray', }} direction="column" spacing={2} justifyContent="center">
                    <Typography fontWeight={600} fontSize={28} color="primary">
                        ${post?.price}(${post?.pricePerNight}/night)
                    </Typography>
                    <Typography fontWeight={600} fontSize={28} color="primary">
                        {post?.numberOfNights} night-stays
                    </Typography>
                    <Typography fontWeight={600} fontSize={22}>
                        Check-in: {formatDate(post?.start_date)}
                    </Typography>
                    <Typography fontWeight={600} fontSize={22}>
                        Check-out: {formatDate(post?.end_date)}
                    </Typography>
                    <Typography fontWeight={400} fontSize={20}>
                        Post by: {post?.current_owner?.username}
                    </Typography>
                </Stack>
                <Stack sx={{ width: 1, display: 'flex', justifyContent: 'flex-start', boxShadow: '0 0 0px gray', mt: 1 }} direction="column" spacing={1} justifyContent="center">
                    <strong>Reservation list</strong>
                    {(reservationList || []).map((item: any, index: number) => (
                        <Card
                            variant="outlined"
                            orientation="horizontal"
                            sx={{
                                width: 1,
                                '&:hover': { boxShadow: 'md', borderColor: 'neutral.outlinedHoverBorder' },
                            }}
                        >
                            <AspectRatio ratio="1" sx={{ width: 50, borderRadius: '50%' }}>
                                <img
                                    src={item?.userId?.profilePicture}
                                    loading="lazy"
                                    alt=""
                                />
                            </AspectRatio>
                            <CardContent>
                                <Typography level="title-lg" id="card-description">
                                    {item?.userId?.username}
                                </Typography>
                                <Typography level="body-sm" aria-describedby="card-description" mb={1}>

                                    {formatDate(item?.reservationDate)}

                                </Typography>
                                <Chip
                                    variant="outlined"
                                    color="success"
                                    size="sm"
                                    sx={{ pointerEvents: 'none' }}
                                >
                                    Is paid
                                </Chip>
                            </CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, '& > button': { flex: 1 } }}>
                                {item?.status === 'confirmed' ?
                                    <Typography level="body-md" aria-describedby="card-description" mb={1}>
                                        <CheckCircleRoundedIcon color="success" />
                                        Confirmed
                                    </Typography>
                                    : <>
                                        <Button variant="solid" color="success" onClick={() => handleConfirmReservation(item?._id)}>
                                            Accept
                                        </Button>
                                        <Button variant="outlined" color="danger">
                                            Reject
                                        </Button>
                                    </>}

                            </Box>
                        </Card>
                    ))}

                </Stack>
            </Grid>

        </Grid>

    );
}
