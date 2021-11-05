import React from 'react';
import Modal from '@material-ui/core/Modal';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { Center } from '../../../Components/Center';
import CircularProgress from '@material-ui/core/CircularProgress';

function IframeLoader(props) {
    const [ loading, setLoading ] = React.useState(true);

    const completeLoading = React.useCallback(() => {
        setLoading(false);
    }, [setLoading]);

    return (
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden', paddingTop: '56.25%' }}>
            {
                loading && (
                    <div style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 99, backgroundColor: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center', top: 0 }}>
                        <CircularProgress color={'secondary'} />
                    </div>
                )
            }
            <iframe 
                onLoad={completeLoading} 
                title={props.title} 
                src={props.url} 
                style={{ border: 0, position: 'absolute', top: 0, left: 0,  bottom: 0, right: 0, width: '100%', height: '100%' }}
            >
            </iframe>
        </div>
    );
}

export function CardMovieTrailerMedia(props) {
    const [ show, setShow ] = React.useState(false);

    const openModal = React.useCallback((evt) => {
        setShow(true);
    }, []);

    const closeModal = React.useCallback(() => {
        setShow(false);
    }, []);

    return (
        <div style={{position: 'relative', display: 'flex', flex: '1 0 150px',  width: '100%'}}>
            {
                props.trailer && (
                    <React.Fragment>
                        <Modal
                            open={show}
                            onClose={closeModal}
                            BackdropProps={{
                                style: {
                                    backgroundColor: 'black'
                                }
                            }}
                        >
                            <Center>
                                <div style={{textAlign: 'right'}}>
                                    <IconButton onClick={closeModal}>
                                        <HighlightOffIcon style={{ color: 'white', fontSize: '1.5em' }} />
                                    </IconButton>
                                </div>
                                <IframeLoader url={`https://drive.google.com/file/d/${props.trailer}/preview`} />
                            </Center>
                        </Modal>
                        <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <IconButton onClick={openModal}>
                                <PlayCircleOutlineIcon style={{ color: 'white', fontSize: '5em' }} />
                            </IconButton>
                        </div>
                    </React.Fragment>
                )
            }
            <CardMedia
                image={`/images/${props.thumb}`}
                title={props.title}
                style={{ backgroundSize: 'contain', backgroundRepeat: 'repeat-x', width: '100%', height: 150 }}
            />
        </div>
    );
}