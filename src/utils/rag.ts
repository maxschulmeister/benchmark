export const insertRAG = (
  prompt: string,
  ragData: any,
  mode: 'majority' | 'bookings',
) => {
  const title = '## Reference Bookings';

  let content = '';
  switch (mode) {
    case 'majority':
      content = `These are the recommended accounts, by getting the 5 most similar bookings from the last 10 years and performing a majority vote:
        \n${JSON.stringify(ragData.majority)}`;
      break;
    case 'bookings':
      content = `These bookings from the past years shall help you accurately determine the correct purchasetaxaccount and costaccount for the current booking.
        \n${JSON.stringify(ragData.bookings)}`;
      break;
    default:
      throw new Error('Invalid mode');
  }
  return [prompt, `${title}\n${content}`].join('\n\n');
};
