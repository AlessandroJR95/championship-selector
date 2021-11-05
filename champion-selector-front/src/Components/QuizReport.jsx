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

export function QuizReport({ report }) {
    return (
        <Box>
            <Box>
                <Typography variant={'h5'} color={'primary'}>
                    {'Respostas'}
                </Typography>
            </Box>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Pergunta</TableCell>
                            {report.judges.map((judge) => (
                                <TableCell>{judge.name}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                        report.questions.map((item) => {
                            return (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Typography variant={'body1'} color={'primary'}>
                                            {item.question}
                                        </Typography>
                                    </TableCell>
                                    {item.answers.map((answer) => (
                                        <TableCell>
                                            <Typography variant={'body1'} color={'primary'}>
                                                {answer}
                                            </Typography>
                                        </TableCell>
                                    ))}
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