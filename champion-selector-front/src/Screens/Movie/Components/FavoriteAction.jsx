import React from 'react';
import Button from '@material-ui/core/Button';
import Favorites from '../Core/favorite';

export function FavoriteAction(props) {
    const [ isFavorite, setIsFavorite ] = React.useState(Favorites.get({ title: props.title }));
    const { thumb, title, description, score, year, trailer } = props;

    const favorite = React.useCallback((evt) => {
        evt.stopPropagation();

        Favorites.add({
            data: {
                thumb,
                title,
                description,
                score,
                year,
                trailer,
            },
            participantID: title
        }, () => {
            setIsFavorite(true);
        });
    }, [setIsFavorite, thumb, title, description, score, year, trailer]);

    return (
        <Button size="small" disabled={isFavorite} onClick={favorite}>Favoritar</Button>
    );
}