import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import { TransitionList } from '../../../Components/TransitionList/TransitionList';
import { MovieCard } from './MovieCard';

export function MovieParticipantList(props) {
    return (
        <List dense>
            <TransitionList
                items={props.participantList}
                getKey={(item) => item.participantID}
                Item={(item, index, all) => {
                    return (
                        <React.Fragment>
                            <ListItem dense>
                                <MovieCard
                                    fullWidth
                                    thumb={item.data.thumb}
                                    title={item.data.title}
                                    description={item.data.description}
                                    score={item.data.score}
                                    year={item.data.year}
                                />
                                {props.render && props.render(item)}
                            </ListItem>
                            {index !== (all.length - 1) ? <Divider /> : null}
                        </React.Fragment>
                    );
                }}
            />
        </List>
    );
}