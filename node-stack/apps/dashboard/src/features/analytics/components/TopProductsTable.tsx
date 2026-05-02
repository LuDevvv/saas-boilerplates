import { Card, Button } from "@node-stack/ui";
import { appToast } from "@/components/alerts/Toasts";
import type { Product } from "../types";

interface TopProductsTableProps {
  products: Product[];
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({ products }) => (
  <Card className="lg:col-span-2 p-8 rounded-[32px] border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 shadow-sm">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-sm font-heading text-slate-900 dark:text-white uppercase">Top Productos</h3>
      <Button
        className="btn-secondary text-[10px] h-9 px-4"
        onClick={() => appToast.info({ title: "Lista completa", description: "La vista completa de productos estará disponible pronto." })}
      >
        Ver Todos
      </Button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-[10px] font-heading text-slate-400 uppercase border-b border-slate-100 dark:border-white/5">
            <th className="pb-4 text-left">Producto</th>
            <th className="pb-4 text-center">Vendidos</th>
            <th className="pb-4 text-right">Ingresos</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-white/5">
          {products.map((item, i) => (
            <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
              <td className="py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-lg">{item.image}</div>
                  <div>
                    <p className="text-xs font-label text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-label">{item.id}</p>
                  </div>
                </div>
              </td>
              <td className="py-5 text-center text-xs font-label text-slate-600 dark:text-slate-300">{item.sold}</td>
              <td className="py-5 text-right text-xs font-kpi text-emerald-500">{item.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);