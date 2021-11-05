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

function uniqueBy(selector) {
    return (acc, item) => {
        const identifier = selector(item);

        if (acc.some((selected) => selector(selected) === identifier)) {
            return acc;
        }

        return acc.concat([item]);
    }
}

function getWinnersPodium(winners) {
    return winners
        .slice()
        .reverse()
        .reduce(uniqueBy((winner) => winner.participant.data.text), [])
        .slice(0, 5)
        .map((winner) => ({ name: winner.participant.data.text }));
}
export function WinnerPodium(props) {
    const { winners } = props;

    return (
        <Box>
            <Box>
                <Typography variant={'h5'} color={'primary'}>
                    {'Posições'}
                </Typography>
            </Box>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Posição</TableCell>
                            <TableCell>Nome</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                        getWinnersPodium(winners).map((winner, index) => {
                            return (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Typography variant={'body1'} color={'primary'}>
                                            {`${index + 1}º`}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant={'body1'} color={'primary'}>
                                            {winner.name}
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