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

export function WinnerHistory(props) {
    const { roundHistory, shouldUpdateHistory } = props;
    const [ roundHistoryState, setRoundHistoryState ] = React.useState(roundHistory);
    const [ shouldUpdate, setShouldUpdate ] = React.useState(shouldUpdateHistory);

    React.useEffect(() => {
        if (shouldUpdate) {
            setRoundHistoryState(roundHistory);
            setShouldUpdate(false);
        }
    }, [shouldUpdate, roundHistory]);

    React.useEffect(() => {
        if (shouldUpdateHistory) {
            setShouldUpdate(true);
        }
    }, [shouldUpdateHistory]);

    return (
        <Box>
            <Box>
                <Typography variant={'h5'} color={'primary'}>
                    {'Histórico'}
                </Typography>
            </Box>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Round</TableCell>
                            <TableCell>Ganhador</TableCell>
                            <TableCell>Perdedor</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                        roundHistoryState.map((history, index) => {
                            return (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Typography variant={'body1'} color={'primary'}>
                                            {history.round}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant={'body1'} color={'primary'}>
                                            {history.winner}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant={'body1'} color={'secondary'}>
                                            {history.loser}
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