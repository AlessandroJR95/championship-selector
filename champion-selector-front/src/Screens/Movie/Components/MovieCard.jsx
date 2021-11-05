import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { CardMovieTrailerMedia } from './CardMovieTrailerMedia';
import ButtonBase from '@material-ui/core/ButtonBase';
import CardActions from '@material-ui/core/CardActions';
import { FavoriteAction } from './FavoriteAction';

export function MovieCard(props) {
    return (
        <Card style={Object.assign({ display: 'flex', flexDirection: 'column' }, props.fullWidth ? { width: '100%' } : null, props.disabled ? { filter: 'grayscale(100%)' } : null)}>
            <CardMovieTrailerMedia
                thumb={props.thumb}
                title={props.title}
                trailer={props.trailer}
            />
            <ButtonBase
                onClick={props.onClick} 
                disabled={props.disabled}
                style={{ width: '100%', flexDirection: 'column' }}
            >
                <CardContent>
                    <div style={{ display: 'block' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body1">
                                {props.score}
                            </Typography>
                            <Typography variant="body1">
                                {props.year}
                            </Typography>
                        </div>
                        <div>
                            <Typography variant="h5" component="h5" color={'primary'}>
                                {props.title}
                            </Typography>
                        </div>
                        <div>
                            <Typography variant="body1">
                                {props.description}
                            </Typography>
                        </div>
                    </div>
                </CardContent>
                {
                    props.canFavorite && (
                        <CardActions>
                            <FavoriteAction
                                thumb={props.thumb}
                                title={props.title}
                                description={props.description}
                                score={props.score}
                                year={props.year}
                                trailer={props.trailer}
                            />
                        </CardActions>
                    )
                }
            </ButtonBase>
        </Card>
    );
}