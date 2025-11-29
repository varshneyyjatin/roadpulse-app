import ExcelJS from 'exceljs';

/**
 * Convert image URL to base64
 */
const urlToBase64 = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image:', error);
    return null;
  }
};

/**
 * Export data to Excel with embedded images
 */
export const exportToExcel = async (data, getPlateImage, getVehicleImage, filename = 'vehicle-report', onProgress = null) => {
  const startTime = Date.now();
  
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Vehicle Reports');

    // Define columns
    worksheet.columns = [
      { header: 'S.No', key: 'sno', width: 8 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Checkpoint', key: 'checkpoint', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Time', key: 'time', width: 12 },
      { header: 'Plate Number', key: 'plateNumber', width: 15 },
      { header: 'Plate Image', key: 'plateImage', width: 25 },
      { header: 'Vehicle Image', key: 'vehicleImage', width: 25 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4B5563' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 25;

    // Report initial progress
    if (onProgress) {
      onProgress({ 
        current: 0, 
        total: data.length, 
        percentage: 0,
        stage: 'Preparing...',
        elapsedTime: 0
      });
    }

    // Add data rows with images
    for (let i = 0; i < data.length; i++) {
      const log = data[i];
      const date = new Date(log.timestamp);
      const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + '.' + String(date.getMilliseconds()).padStart(3, '0');

      const rowIndex = i + 2; // +2 because header is row 1, data starts from row 2
      
      // Add text data
      worksheet.addRow({
        sno: i + 1,
        location: log.location_name || '-',
        checkpoint: log.checkpoint_name || '-',
        date: formattedDate,
        time: formattedTime,
        plateNumber: log.plate_number || '-',
        plateImage: '', // Will be replaced with image
        vehicleImage: '' // Will be replaced with image
      });

      // Set row height for images
      worksheet.getRow(rowIndex).height = 80;
      worksheet.getRow(rowIndex).alignment = { vertical: 'middle', horizontal: 'center' };

      // Add plate image
      try {
        const plateImageUrl = getPlateImage(log);
        const plateBase64 = await urlToBase64(plateImageUrl);
        
        if (plateBase64) {
          const plateImageId = workbook.addImage({
            base64: plateBase64,
            extension: 'png',
          });

          worksheet.addImage(plateImageId, {
            tl: { col: 6, row: rowIndex - 1 },
            ext: { width: 150, height: 70 }
          });
        }
      } catch (error) {
        console.error('Error adding plate image:', error);
      }

      // Add vehicle image
      try {
        const vehicleImageUrl = getVehicleImage(log);
        const vehicleBase64 = await urlToBase64(vehicleImageUrl);
        
        if (vehicleBase64) {
          const vehicleImageId = workbook.addImage({
            base64: vehicleBase64,
            extension: 'png',
          });

          worksheet.addImage(vehicleImageId, {
            tl: { col: 7, row: rowIndex - 1 },
            ext: { width: 150, height: 70 }
          });
        }
      } catch (error) {
        console.error('Error adding vehicle image:', error);
      }

      // Report progress
      if (onProgress) {
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
        const percentage = Math.round(((i + 1) / data.length) * 100);
        onProgress({ 
          current: i + 1, 
          total: data.length, 
          percentage,
          stage: 'Processing records...',
          elapsedTime
        });
      }
    }

    // Generate and download
    if (onProgress) {
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
      onProgress({ 
        current: data.length, 
        total: data.length, 
        percentage: 100,
        stage: 'Generating file...',
        elapsedTime
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}-${Date.now()}.xlsx`;
    link.click();

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    return { success: true, message: 'Excel file with images downloaded successfully!', totalTime };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return { success: false, message: 'Failed to export Excel file.' };
  }
};

/**
 * Export data to CSV (simple version without images)
 */
export const exportToCSV = (data, filename = 'vehicle-report') => {
  try {
    const csvData = data.map((log, index) => {
      const date = new Date(log.timestamp);
      const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + '.' + String(date.getMilliseconds()).padStart(3, '0');

      return {
        'S.No': index + 1,
        'Location': log.location_name || '-',
        'Checkpoint': log.checkpoint_name || '-',
        'Date': formattedDate,
        'Time': formattedTime,
        'Plate Number': log.plate_number || '-'
      };
    });

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, message: 'CSV file downloaded successfully!' };
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return { success: false, message: 'Failed to export CSV file.' };
  }
};
