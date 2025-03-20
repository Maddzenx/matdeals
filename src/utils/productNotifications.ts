
export const showNoIcaProductsWarning = () => {
  console.warn("No ICA products found in database. Check if scraping was successful.");
};

export const showFetchErrorNotification = (error: any) => {
  console.error('Error fetching products from Supabase:', error);
};
