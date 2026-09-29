import RestaurantView from "./RestaurantView";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RestaurantView restaurantId={id} />;
}
