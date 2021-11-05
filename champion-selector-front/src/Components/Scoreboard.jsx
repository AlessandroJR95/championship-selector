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
import { Fade } from './Fade/Fade';

function HiddenPaper(props) {
    return (
        <Paper {...props} style={{ overflow: 'hidden' }} />
    );
}

function getAnimationDelay(index, length) {
    return (length - index) * 1500;
}

export function Scoreboard(props) {
    const { scoreboard, show } = props;

    return (
        <Box>
            <Box>
                <Typography variant={'h5'} color={'primary'}>
                    {'Scoreboard'}
                </Typography>
            </Box>
            <TableContainer component={HiddenPaper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Posição</TableCell>
                            <TableCell>Nome</TableCell>
                            <TableCell>Pontos</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                        scoreboard.map((score, index) => {
                            return (
                                <TableRow key={score.id}>
                                    <TableCell>
                                        <Fade show={show} delay={getAnimationDelay(index, scoreboard.length)}>
                                            <Typography variant={'body1'} color={'primary'}>
                                                {`${index + 1}º`}
                                            </Typography>
                                        </Fade>
                                    </TableCell>
                                    <TableCell>
                                        <Fade show={show} delay={getAnimationDelay(index, scoreboard.length)}>
                                            <Typography variant={'body1'} color={'primary'}>
                                                {score.name}
                                            </Typography>
                                        </Fade>
                                    </TableCell>
                                    <TableCell>
                                        <Fade show={show} delay={getAnimationDelay(index, scoreboard.length)}>
                                            <Typography variant={'body1'} color={'primary'}>
                                                {score.text}
                                            </Typography>
                                        </Fade>
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