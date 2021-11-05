import React from 'react';
import Grid from '@material-ui/core/Grid';
import Form from '../Core/form';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import { JudgeList } from '../../../Components/JudgeList';

function QuestionOptionInput({ option, index, onChange }) {

    const onChangeTitle = React.useCallback((e) => {
        onChange(index, {
            ...option,
            text: e.target.value
        })
    }, [index, option, onChange]);

    return (
        <div style={{ paddingTop: 5, paddingBottom: 5, paddingLeft: 15, paddingRight: 5 }}>
            <TextField
                value={option.text}
                onChange={onChangeTitle}
                placeholder={'Opção'}
                fullWidth
                variant="outlined"
                autoFocus
            />
        </div>
    );
}

function QuestionInput({ question, index, onAddOption, onChange }) {

    const addQuestionOption = React.useCallback(() => {
        onAddOption(index);
    }, [onAddOption, index]);

    const onChangeTitle = React.useCallback((e) => {
        onChange(index, {
            ...question,
            text: e.target.value
        })
    }, [index, question, onChange]);

    const onChangeOption = React.useCallback((jndex, data) => {
        onChange(index, {
            ...question,
            options: [
                ...question.options.slice(0, jndex),
                data,
                ...question.options.slice(jndex + 1),
            ]
        })
    }, [index, question, onChange]);

    return (
        <div style={{ padding: 10 }}>
            <div style={{ padding: 5 }}>
                <TextField
                    value={question.text}
                    onChange={onChangeTitle}
                    placeholder={'Titulo'}
                    fullWidth
                    variant="outlined"
                    autoFocus
                />
            </div>
            {question.options.map((option, jndex) => (
                <QuestionOptionInput
                    option={option}
                    index={jndex}
                    onChange={onChangeOption}
                />
            ))}
            <Button variant="outlined" color="primary" onClick={addQuestionOption}>
                {'+ Opção'}
            </Button>
        </div>
    );
}

function QuizForm({ state, setQuestions }) {
    const addQuestion = React.useCallback(() => {
        setQuestions((state) => state.concat({ text: '', options: [{ text: '' }, { text: '' }] }));
    }, [setQuestions]);

    const addQuestionOption = React.useCallback((index) => {
        setQuestions((state) => {
            const local = state.slice(0);

            local[index].options.push({ text: '' });

            return local;
        });
    }, [setQuestions]);

    
    const changeQuestion = React.useCallback((index, data) => {
        setQuestions((state) => {
            const local = state.slice(0);

            local[index] = {...data};

            return local;
        });
    }, [setQuestions]);

    return (
        <div style={{ textAlign: 'right' }}>
            {state.map((question, index) => (
                <QuestionInput
                    question={question}
                    index={index}
                    onAddOption={addQuestionOption}
                    onChange={changeQuestion}
                />
            ))}
            <Button variant="outlined" color="primary" onClick={addQuestion}>
                {'+ Questão'}
            </Button>
        </div>
    );
}

function useQuestionForm() {
    const [ state, setQuestions ] = React.useState(Form.loadForm() || []);

    React.useEffect(() => {
        return () => Form.clear();
    }, [Form]);

    React.useEffect(() => {
        Form.save(state);
    }, [Form, state]);

    return [ state, setQuestions ];
}

function PreparationView(props) {
    const { isOwner, readyQuiz, multiple } = props;
    const [ state, setQuestions ] = useQuestionForm();

    const readyCheck = React.useCallback(({ ready }) => {
        return ready;
    }, []);

    const readyQuizProxy = React.useCallback(() => {
        readyQuiz(state);
    }, [state, readyQuiz]);

    return (
        <Grid container spacing={0}>
            <Grid item xs={12}>
                <Box style={{ padding: "20px 20px 0 20px" }}>
                    <JudgeList 
                        judgeList={props.judgeList}
                        readyCheck={readyCheck}
                        judgeID={props.judgeID}
                        onKick={isOwner ? props.onJudgeKick : null}
                    />
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box style={{ margin: 20 }}>
                    {
                        multiple || isOwner ? (
                            <QuizForm
                                state={state}
                                setQuestions={setQuestions}
                            />
                        ) : (
                            <Typography variant={'h5'} color={'primary'}>
                                {'Aguarde enquanto a sala é configurada'}
                            </Typography>
                        )
                    }
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box style={{ margin: 10 }}>
                    {
                        <div style={{ textAlign: 'center' }}>
                            <Button variant="outlined" color="secondary" onClick={readyQuizProxy} disabled={props.isReady}>
                                Estou pronto!
                            </Button>
                        </div>
                    }
                </Box>
            </Grid>
        </Grid>
    );
}

export const Preparation = React.memo(PreparationView);