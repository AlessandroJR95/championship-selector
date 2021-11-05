import React from 'react';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

export function LikeList(props) {
    const { likeList } = props;

    return (
        <Box>
            <Box>
                <Typography variant={'h5'} color={'primary'}>
                    {'Apostas'}
                </Typography>
            </Box>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Nome</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                        likeList.map((name, index) => {
                            return (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Typography variant={'body1'} color={'primary'}>
                                            {name}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    }
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}