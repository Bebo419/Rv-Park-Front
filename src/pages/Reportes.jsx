import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { exportToExcel, exportToCSV, exportToPDF } from '../utils/exportUtils';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import { RV_PARKS } from '../utils/constants';

const Reportes = () => {
  const [selectedPark, setSelectedPark] = useState(RV_PARKS[0].id);
  const [selectedReport, setSelectedReport] = useState('ocupacion');

  const reportTypes = [
    { value: 'ocupacion', label: 'Reporte de Ocupación' },
    { value: 'ingresos', label: 'Reporte de Ingresos' },
    { value: 'pagos', label: 'Pagos Pendientes' },
    { value: 'clientes', label: 'Reporte de Clientes' },
  ];

  const handleExport = (format) => {
    const sampleData = [
      { id: 1, concepto: 'Ejemplo 1', monto: 1000 },
      { id: 2, concepto: 'Ejemplo 2', monto: 2000 },
    ];

    switch (format) {
      case 'excel':
        exportToExcel(sampleData, `reporte_${selectedReport}`);
        break;
      case 'csv':
        exportToCSV(sampleData, `reporte_${selectedReport}`);
        break;
      case 'pdf':
        exportToPDF(
          'Reporte de Ejemplo',
          ['ID', 'Concepto', 'Monto'],
          sampleData.map(d => [d.id, d.concepto, `$${d.monto}`]),
          `reporte_${selectedReport}`
        );
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Reportes y Exportaciones</h1>
        <p className="text-neutral-500 mt-1">Genera y exporta reportes del sistema</p>
      </div>

      <Card>
        <div className="grid md:grid-cols-2 gap-4">
          <Select
            label="RV Park"
            value={selectedPark}
            onChange={(e) => setSelectedPark(Number(e.target.value))}
            options={RV_PARKS.map(p => ({ value: p.id, label: p.nombre }))}
          />
          <Select
            label="Tipo de Reporte"
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            options={reportTypes}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button icon={FiDownload} onClick={() => handleExport('excel')} variant="success">
            Exportar Excel
          </Button>
          <Button icon={FiDownload} onClick={() => handleExport('csv')} variant="secondary">
            Exportar CSV
          </Button>
          <Button icon={FiDownload} onClick={() => handleExport('pdf')} variant="danger">
            Exportar PDF
          </Button>
        </div>
      </Card>

      <Card title="Vista Previa">
        <p className="text-center text-neutral-500 py-12">
          Los datos del reporte aparecerán aquí
        </p>
      </Card>
    </div>
  );
};

export default Reportes;
