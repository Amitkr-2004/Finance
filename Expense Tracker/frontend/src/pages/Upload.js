import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Receipt as ReceiptIcon,
  Description as PdfIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { uploadAPI } from '../services/api';

const Upload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const handleReceiptUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadAPI.uploadReceipt(formData);
      setUploadResults(prev => [...prev, {
        id: Date.now(),
        type: 'receipt',
        filename: file.name,
        status: 'success',
        message: 'Receipt processed successfully - transaction created'
      }]);
      setNotification({
        open: true,
        message: 'Receipt uploaded and processed successfully!',
        severity: 'success'
      });
    } catch (error) {
      setUploadResults(prev => [...prev, {
        id: Date.now(),
        type: 'receipt',
        filename: file.name,
        status: 'error',
        message: error.response?.data?.error || 'Upload failed'
      }]);
      setNotification({
        open: true,
        message: error.response?.data?.error || 'Receipt upload failed',
        severity: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleStatementUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadAPI.uploadBankStatement(formData);
      setUploadResults(prev => [...prev, {
        id: Date.now(),
        type: 'statement',
        filename: file.name,
        status: 'success',
        message: response.data.message || 'Bank statement processed successfully'
      }]);
      setNotification({
        open: true,
        message: 'Bank statement uploaded and processed successfully!',
        severity: 'success'
      });
    } catch (error) {
      setUploadResults(prev => [...prev, {
        id: Date.now(),
        type: 'statement',
        filename: file.name,
        status: 'error',
        message: error.response?.data?.error || 'Upload failed'
      }]);
      setNotification({
        open: true,
        message: error.response?.data?.error || 'Bank statement upload failed',
        severity: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
        Upload Files
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <ReceiptIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Upload Receipt
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Upload receipt images (JPG, PNG) for automatic OCR processing and expense creation.
              </Typography>
              
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="receipt-upload"
                type="file"
                onChange={handleReceiptUpload}
              />
              <label htmlFor="receipt-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<UploadIcon />}
                  size="large"
                  disabled={uploading}
                  sx={{ px: 4, py: 1.5 }}
                >
                  {uploading ? 'Uploading...' : 'Select Receipt'}
                </Button>
              </label>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <PdfIcon sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Upload Bank Statement
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Upload PDF bank statements for bulk transaction import and automatic categorization.
              </Typography>
              
              <input
                accept=".pdf"
                style={{ display: 'none' }}
                id="statement-upload"
                type="file"
                onChange={handleStatementUpload}
              />
              <label htmlFor="statement-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<UploadIcon />}
                  size="large"
                  disabled={uploading}
                  color="secondary"
                  sx={{ px: 4, py: 1.5 }}
                >
                  {uploading ? 'Uploading...' : 'Select PDF'}
                </Button>
              </label>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upload Progress */}
      {uploading && (
        <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Processing file...
          </Typography>
          <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
        </Paper>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Upload History
          </Typography>
          <List>
            {uploadResults.map((result, index) => (
              <React.Fragment key={result.id}>
                <ListItem>
                  <ListItemIcon>
                    {result.status === 'success' ? (
                      <SuccessIcon color="success" />
                    ) : (
                      <ErrorIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={result.filename}
                    secondary={result.message}
                  />
                </ListItem>
                {index < uploadResults.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Instructions remain the same */}
      <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Upload Instructions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Receipt Upload
            </Typography>
            <List dense>
              <ListItem disableGutters>
                <Typography variant="body2">• Supported formats: JPG, PNG, GIF</Typography>
              </ListItem>
              <ListItem disableGutters>
                <Typography variant="body2">• Maximum file size: 10MB</Typography>
              </ListItem>
              <ListItem disableGutters>
                <Typography variant="body2">• Ensure text is clear and readable</Typography>
              </ListItem>
              <ListItem disableGutters>
                <Typography variant="body2">• OCR will extract amount, date, and merchant</Typography>
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Bank Statement Upload
            </Typography>
            <List dense>
              <ListItem disableGutters>
                <Typography variant="body2">• Supported formats: PDF only</Typography>
              </ListItem>
              <ListItem disableGutters>
                <Typography variant="body2">• Maximum file size: 10MB</Typography>
              </ListItem>
              <ListItem disableGutters>
                <Typography variant="body2">• Must contain tabular transaction data</Typography>
              </ListItem>
              <ListItem disableGutters>
                <Typography variant="body2">• Bulk import multiple transactions</Typography>
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Upload;
