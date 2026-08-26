export const categoryDetails = {
  RED: {
    label: 'Immediate',
    responseTime: '0 min',
    color: '#ff4f67'
  },
  ORANGE: {
    label: 'Very urgent',
    responseTime: '10 min',
    color: '#ff9f43'
  },
  YELLOW: {
    label: 'Urgent',
    responseTime: '60 min',
    color: '#ffd166'
  },
  GREEN: {
    label: 'Standard',
    responseTime: '120 min',
    color: '#39d98a'
  },
  BLUE: {
    label: 'Non-urgent',
    responseTime: '240 min',
    color: '#55a8ff'
  }
};

export const categoryNames = Object.keys(categoryDetails);
