import React from 'react';
import { MovieParticipantList } from './MovieParticipantList';
import Favorites from '../Core/favorite';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

function MovieItemDeleteButton(props) {
    const { onDelete, participantID } = props;

    const onClick = React.useCallback(() => {
        onDelete({ participantID });
    }, [participantID, onDelete]);

    return (
        <IconButton
            color="primary"
            onClick={onClick}
        >
            <HighlightOffIcon />
        </IconButton>
    );
}

export function FavoriteMovies() {
    const [ favorites, setFavorites ] = React.useState(Favorites.getAll());

    const deleteMovie = React.useCallback(({ participantID }) => {
        Favorites.remove(participantID, setFavorites);
    }, [setFavorites]);

    return favorites && favorites.length ? (
        <div style={{ marginTop: 20 }}>
            <div>
                <Typography variant="h5" component="h5" color={'secondary'}>
                    {'Favoritos'}
                </Typography>
            </div>
            <div style={{ padding: 10 }}>
                <MovieParticipantList
                    participantList={favorites}
                    onDelete={deleteMovie}
                    canDelete
                    render={({ participantID }) => {
                        return (
                            <MovieItemDeleteButton participantID={participantID} onDelete={deleteMovie} />
                        );
                    }}
                />
            </div>
        </div>
    ) : null;
}