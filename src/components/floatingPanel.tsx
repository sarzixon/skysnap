import Box from "@mui/material/Box";

export default function FloatingPanel({ left = '5%', top, bottom, children }: {
    left?: string,
    top?: string,
    bottom?: string,
    children: React.ReactNode
}) {
    return (
        <Box
            sx={{
                position: 'absolute',
                zIndex: 10,
                left,
                top,
                bottom
            }}
        >
            {children}
        </Box>
    )
};
