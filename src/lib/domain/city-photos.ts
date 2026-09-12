export function cityPhotoSrc(id: string, width = 1400) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=70`;
}

const CITY_PHOTOS: Record<
  string,
  { id: string; alt: string }
> = {
  madrid: {
    id: "photo-1539037116277-4db20889f2d4",
    alt: "Gran Vía de Madrid",
  },
  barcelona: {
    id: "photo-1583422409516-2895a77efded",
    alt: "Sagrada Família en Barcelona",
  },
  valencia: {
    id: "photo-1577990432593-6bf35f43beed",
    alt: "Ciudad de las Artes y las Ciencias en Valencia",
  },
  malaga: {
    id: "photo-1693561220476-c0531bbdcd09",
    alt: "Centro histórico de Málaga",
  },
  sevilla: {
    id: "photo-1559386081-325882507af7",
    alt: "Plaza de España en Sevilla",
  },
};

export function cityPhoto(slug: string) {
  const photo = CITY_PHOTOS[slug];
  if (!photo) return null;
  return {
    src: cityPhotoSrc(photo.id),
    alt: photo.alt,
  };
}
