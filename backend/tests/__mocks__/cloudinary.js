module.exports = {
  uploader: {
    upload: jest.fn(() => Promise.resolve({
      public_id: 'mock_public_id',
      secure_url: 'https://mock.cloudinary.com/mock_image.jpg'
    })),
    destroy: jest.fn(() => Promise.resolve({ result: 'ok' }))
  },
  config: jest.fn(),
  v2: {
    uploader: {
      upload: jest.fn(() => Promise.resolve({
        public_id: 'mock_public_id',
        secure_url: 'https://mock.cloudinary.com/mock_image.jpg'
      })),
      destroy: jest.fn(() => Promise.resolve({ result: 'ok' }))
    },
    config: jest.fn()
  }
}; 