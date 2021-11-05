import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LabelIcon from '@material-ui/icons/Label';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { TransitionList } from './TransitionList/TransitionList';

function ParticipantItemDeleteButton(props) {
    const { onDelete, participantID, disableDelete } = props;

    const onClick = React.useCallback(() => {
        onDelete({ participantID });
    }, [participantID, onDelete]);

    return (
        <IconButton
            color="primary"
            onClick={onClick}
            disabled={disableDelete}
        >
            <HighlightOffIcon />
        </IconButton>
    );
}

function ParticipantItemLikeButton(props) {
    const { onLike, participantID, liked } = props;

    const onClick = React.useCallback(() => {
        onLike({ participantID });
    }, [participantID, onLike]);

    return (
        <IconButton
            color={liked ? "secondary" : "primary"}
            onClick={onClick}
        >
            <ThumbUpIcon />
        </IconButton>
    );
}

export function ParticipantList(props) {
    return (
        <List dense>
            <TransitionList
                items={props.participantList}
                getKey={(item) => item.participantID}
                Item={(item, index, all) => {
                    return (
                        <React.Fragment>
                            <ListItem dense>
                                    <ListItemIcon><LabelIcon /></ListItemIcon>
                                    <ListItemText>
                                        <Typography variant={'body1'}>
                                            {item.data.text}
                                        </Typography>
                                    </ListItemText>
                                    <ListItemIcon>
                                        <ParticipantItemLikeButton
                                            participantID={item.participantID}
                                            onLike={props.onLike}
                                            liked={props.isLiked && props.isLiked(item)}
                                        />
                                    </ListItemIcon>
                                    { props.canDelete && (
                                        <ListItemIcon>
                                            <ParticipantItemDeleteButton
                                                participantID={item.participantID}
                                                onDelete={props.onDelete}
                                                disableDelete={props.disableDelete}
                                            />
                                        </ListItemIcon>
                                    )}
                            </ListItem>
                            {index !== (all.length - 1) ? <Divider /> : null}
                        </React.Fragment>
                    );
                }}
            />
        </List>
    );
}