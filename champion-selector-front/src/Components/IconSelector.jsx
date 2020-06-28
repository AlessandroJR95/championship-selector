import React from 'react';
import Box from "@material-ui/core/Box";
import Grid from '@material-ui/core/Grid';
import {
    AccountCircle,
    Adb,
    Accessibility,
    Face,
    WbSunny,
    Apple,
    Android,
    Audiotrack,
    Brightness3,
    ChildCare,
    GitHub,
    InsertEmoticon,
    LocalFlorist,
    MoodBad,
    Pets,
    Person,
} from '@material-ui/icons';

const Icons = {
    AccountCircle,
    Adb,
    Accessibility,
    Face,
    WbSunny,
    Apple,
    Android,
    Audiotrack,
    Brightness3,
    ChildCare,
    GitHub,
    InsertEmoticon,
    LocalFlorist,
    MoodBad,
    Pets,
    Person,
}

function IconSelectorButton(props) {
    const { name, onClick, selected } = props;

    const onClickProxy = React.useCallback(() => {
        onClick(name);
    }, [name, onClick]);

    return (
        <Box 
            style={{ textAlign: 'center' }} 
            onClick={onClickProxy}
        >
            {
                React.cloneElement(props.children, {
                    fontSize: 'large',
                    color: selected ? 'secondary' : 'primary'
                })
            }
        </Box>
    );
}

export function IconSelectorIcon(props) {
    let Component = null; 

    if (props.name) {
        Component = Icons[props.name];
    }

    return Component ? (
        <Component
            {...props}
        />
    ) : null;
}

export function IconSelector(props) {
    return (
        <Grid container spacing={3}>
            {
                props.icons.map(({ name }) => {
                    return (
                        <Grid item xs={3}>
                            <IconSelectorButton 
                                selected={props.value === name} 
                                name={name}
                                onClick={props.onChange}
                            >
                                <IconSelectorIcon name={name} />
                            </IconSelectorButton>
                        </Grid>
                    );
                })
            }
        </Grid>
    );
}