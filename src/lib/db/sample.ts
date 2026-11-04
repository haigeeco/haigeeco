"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { newId, nowIso } from "@/lib/ids";

export function useLoadSampleData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const supabase = getSupabase();
      const stamp = nowIso();
      const clients = [
        { name: "Kopi Senja", contact_person: "Rina", phone: "0812-3456-7890", email: "order@kopisenja.id", address: "Jl. Kemang Raya No. 12", city: "Jakarta Selatan", npwp: "", notes: "Order rutin tiap Senin & Kamis." },
        { name: "Kafe Ruang Tengah", contact_person: "Dimas", phone: "0813-2211-4455", email: "dimas@ruangtengah.co", address: "Jl. Dago No. 88", city: "Bandung", npwp: "", notes: "Butuh invoice dengan PPN." },
        { name: "Sweet Corner", contact_person: "Ayu", phone: "0857-9988-1122", email: "ayu@sweetcorner.id", address: "Jl. Gajah Mada No. 5", city: "Semarang", npwp: "", notes: "" },
      ].map((client) => ({ id: newId(), ...client, created_at: stamp, updated_at: stamp }));

      const products = [
        { sku: "GC-BSC-6", name: "Basque Burnt Cheesecake", description: "Box isi 6 potong", unit: "box", price: 185000, active: true },
        { sku: "GC-BRW-9", name: "Brownies Fudge", description: "Box isi 9 potong", unit: "box", price: 120000, active: true },
        { sku: "GC-DBT", name: "Dessert Box Tiramisu", description: "Cup 250ml", unit: "cup", price: 25000, active: true },
        { sku: "GC-PDG", name: "Puding Regal", description: "Cup 200ml", unit: "cup", price: 15000, active: true },
        { sku: "GC-CRS", name: "Croissant Butter", description: "Satuan", unit: "pcs", price: 18000, active: true },
      ].map((product) => ({ id: newId(), ...product, created_at: stamp, updated_at: stamp }));

      const { error: clientError } = await supabase.from("clients").insert(clients);
      if (clientError) throw clientError;
      const { error: productError } = await supabase.from("products").insert(products);
      if (productError) throw productError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
