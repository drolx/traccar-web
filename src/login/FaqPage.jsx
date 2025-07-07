import LoginLayout from './LoginLayout';
import {
 Paper, Accordion, AccordionSummary, AccordionDetails, Typography, 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTheme } from '@mui/material/styles';
import Faqs from '../data/faqs.json';

const FaqPage = () => {
    const theme = useTheme();

    return (
        <LoginLayout isForm={false}>
            <div style={{ padding: theme.spacing(8, 2), }}>
                <Typography variant="h4" sx={{ textAlign: 'center' }}>
                    {'Frequently Asked Questions'}
                </Typography>
                <Paper sx={{ marginTop: 5 }}>
                    {Faqs.map((faq, index) => (
                        <Accordion key={index} defaultExpanded={index === 0}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={`panel-content-${index}`}
                                id={`panel-${index}`}
                            >
                                {faq.question}
                            </AccordionSummary>
                            <AccordionDetails sx={{ minHeight: '120px' }}>
                                {faq.answer}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Paper>
            </div>
        </LoginLayout>
    )
}

export default FaqPage;
