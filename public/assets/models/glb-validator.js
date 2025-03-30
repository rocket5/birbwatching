// Simple GLB file validator
function validateGLB(url) {
  return new Promise((resolve, reject) => {
    // Fetch the GLB file as an ArrayBuffer
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
        }
        return response.arrayBuffer();
      })
      .then(arrayBuffer => {
        try {
          // Check if it's a GLB file (starts with glTF magic bytes)
          const header = new DataView(arrayBuffer, 0, 12);
          const magic = header.getUint32(0, true);
          const version = header.getUint32(4, true);
          const length = header.getUint32(8, true);
          
          // gltf magic should be 0x46546C67 (ASCII for 'glTF')
          if (magic !== 0x46546C67) {
            throw new Error(`Invalid magic: ${magic.toString(16)}, expected: 46546C67`);
          }
          
          console.log('GLB Validation:', {
            magic: '0x' + magic.toString(16),
            version: version,
            length: length,
            fileSize: arrayBuffer.byteLength,
            valid: magic === 0x46546C67 && version === 2
          });
          
          resolve({
            valid: true,
            magic: '0x' + magic.toString(16),
            version: version,
            length: length,
            fileSize: arrayBuffer.byteLength
          });
        } catch (error) {
          console.error('GLB validation error:', error);
          reject(error);
        }
      })
      .catch(error => {
        console.error('Error fetching GLB file:', error);
        reject(error);
      });
  });
}

// Export for use in other scripts
window.validateGLB = validateGLB; 