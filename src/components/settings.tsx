import { Card, Checkbox, FormGroup, List, ListItem, ListItemText } from "@mui/material";

export default function Settings() {

    //present current layers

    return (
        <Card
            sx={{
                position: 'absolute',
                zIndex: 10,
                left: '5%',
                top: '5%'
            }}
        >
            <List>
                <ListItem>
                    <Checkbox />
                    <ListItemText>Warstwa 1</ListItemText>
                </ListItem>
            </List>
        </Card>
    );
};
