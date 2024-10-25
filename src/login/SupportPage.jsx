import LoginLayout from './LoginLayout';
import { Avatar, Paper, Card, CardActionArea, CardMedia, CardContent, Stack, Typography, Link, Divider } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useTheme } from '@mui/material/styles';
import Contacts from '../data/contacts.json';

const SupportPage = () => {
    const t = useTranslation();
    const theme = useTheme();

    return (
        <LoginLayout isForm={false}>
            <div style={{ padding: theme.spacing(4, 2) }}>
                <Typography variant="h3" sx={{ textAlign: 'center' }}>
                    {`${t('settingsSupport')} ${t('deviceContact')}`}
                </Typography>
                <Paper sx={{ margin: theme.spacing(2, 0) }}>
                    <Typography variant="h5" sx={{ margin: theme.spacing(1, 0) }}>
                        {"Keep in touch. We'd love to hear from you"}
                    </Typography>
                    <Typography sx={{ maxWidth: 455, padding: 1, }} variant="body2" color="secondary">
                    {'Call us today for inquiries or to find a time that is convenient for you to schedule resolve your issues or schedule an installation'}
                    </Typography>
                    <Card>
                        <CardActionArea>
                            <CardMedia
                                component="img"
                                height="210"
                                image="/support-center.jpg"
                                alt="green iguana"
                            />
                            <CardContent>
                                <div style={{ margin: theme.spacing(2, 0) }}>
                                    <Typography gutterBottom variant="h5" component="div">
                                        {'Phones'}
                                    </Typography>
                                    <Divider sx={{ margin: theme.spacing(1, 0) }} />
                                    {
                                        Contacts.phones.map(phone => (
                                            <Link sx={{ margin: theme.spacing(0, 1) }} underline="none" href={`tel:${phone.phoneNumber}`}>
                                                <Stack sx={{ gap: 3 }} direction="row" alignItems="center">
                                                    <Avatar>
                                                        <PhoneIcon />
                                                    </Avatar>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {phone.label}
                                                    </Typography>
                                                </Stack>
                                            </Link>
                                        ))
                                    }
                                </div>
                                <div>
                                    <Typography gutterBottom variant="h5" component="div">
                                        {'Others'}
                                    </Typography>
                                    <Divider sx={{ margin: theme.spacing(1, 0) }} />
                                    <Link underline="none" href="mailto:hello@drolx.com">
                                        <Stack sx={{ gap: 3, marginBottom: 2 }} direction="row" alignItems="center">
                                            <Avatar>
                                                <EmailIcon />
                                            </Avatar>
                                            <Typography variant="body2" color="text.secondary">
                                                {Contacts.email}
                                            </Typography>
                                        </Stack>
                                    </Link>
                                    {/** Chat link */}
                                    <Link underline="none" href={Contacts.whatsApp.link}>
                                        <Stack sx={{ gap: 3 }} direction="row" alignItems="center">
                                            <Avatar>
                                                <ChatBubbleIcon />
                                            </Avatar>
                                            <Typography variant="body2" color="text.secondary">
                                                {Contacts.whatsApp.label}
                                            </Typography>
                                        </Stack>
                                    </Link>
                                </div>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Paper>
            </div>
        </LoginLayout>
    )
}

export default SupportPage;
