import * as React from 'react';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import CardActions from '@mui/joy/CardActions';
import { styled, Grid } from '@mui/joy';
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate, useNavigate, NavLink, Link } from "react-router-dom";
import CardContent from '@mui/joy/CardContent';
import Button from '@mui/joy/Button';
import { GetAllAccount, BanAnAccount, DeleteAccount } from '../../services/admin.services';

var { createCanvas } = require("canvas");

interface RootState {
    auth: {
        isAuthenticated: boolean;
        user: any;
    };
}

export default function AccountList() {
    const user = useSelector((state: RootState) => state?.auth?.user);
    const [accounts, setAccounts] = React.useState([]);
    const navigate = useNavigate();

    React.useEffect(() => {
        getAllAccounts();
    }, []);

    async function getAllAccounts() {
        const allAccounts = await GetAllAccount();
        if (allAccounts && allAccounts.length > 0) {
            console.log("Log all account:" + allAccounts);
            setAccounts(allAccounts);
        }
    }

    async function handleBan(id: string) {
        // Your logic to handle accepting the request goes here
        console.log("Ban account:", id);
        BanAnAccount(id);
        window.location.reload();
    }

    async function handleDelete(id: string) {
        // Your logic to handle canceling the request goes here
        console.log("Delete account:", id);
        DeleteAccount(id);
        window.location.reload();
    }

    return (
        <>
        

        <Grid container spacing={2} sx={{ flexGrow: 1, mx: { xs: 2, md: 5 }, mt: 2 }}>
            {accounts.length > 0 && accounts.map((account: any, index: number) => (
                <Grid key={index} xs={12} md={6} lg={4}>
                    <Card>
                        <CardContent>
                            <Typography component="div">
                                Username: {account.username}
                            </Typography>
                            <Typography >
                                Email: {account.email}
                            </Typography>
                            <Typography>
                                Role: {account.role}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            {account.isBanned !== "true" && (
                                <Button onClick={() => handleBan(account._id)}>Ban</Button>
                            )}
                            {(
                                <Button onClick={() => handleDelete(account._id)}>Delete</Button>
                            )}
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </Grid>
        </>
    );
}
