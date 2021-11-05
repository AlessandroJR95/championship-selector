import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { Fade } from './Fade/Fade';

export function PartialResult({ result, onTransitionEnd, fadeOut }) {
    const [ showIntroduction, setShowIntroduction ] = React.useState(false);

    const dismissAnnoucer = React.useCallback(() => {
        setTimeout(() => {
            if (fadeOut) {
                setShowIntroduction(false);
            }
        }, 5000);
    }, [setShowIntroduction, fadeOut]);

    React.useLayoutEffect(() => {
        setShowIntroduction(true);
    }, []);

    return (
        <React.Fragment>
            <Fade show={showIntroduction} longer onEntered={dismissAnnoucer} onExited={onTransitionEnd}>
                <Box textAlign='center'>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Resposta</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            {
                                result.map((item, index) => {
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Typography variant={'body1'} color={'primary'}>
                                                    {item.judge.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant={'body1'} color={'primary'}>
                                                    {item.participant.data.text}
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
            </Fade>
        </React.Fragment>
    );
}