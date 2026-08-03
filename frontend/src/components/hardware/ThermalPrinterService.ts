import { useLanguageStore } from '../../core/store/languageStore';

/**
 * Servicio WebDirect Thermal Printer para impresión directa ESC/POS
 * vía WebUSB, WebSerial o WebBluetooth sin diálogos del SO (<2.0s SLA).
 */

export class ThermalPrinterService {
  private static ESC = 0x1b;
  private static GS = 0x1d;

  public static generateESCPOSBuffer(ticketData: {
    title: string;
    invoice: string;
    items: Array<{ name: string; qty: number; price: number }>;
    total: number;
    footer?: string;
  }): Uint8Array {
    const encoder = new TextEncoder();
    const commands: number[] = [];
    const t = useLanguageStore.getState().t;

    // Inicializar impresora ESC @
    commands.push(this.ESC, 0x40);

    // Alineación centro (ESC a 1)
    commands.push(this.ESC, 0x61, 1);
    commands.push(...encoder.encode(`${ticketData.title || t('tickets.receipt_header')}\n`));
    commands.push(...encoder.encode(`${t('tickets.ticket_num')}: ${ticketData.invoice}\n`));
    commands.push(...encoder.encode('--------------------------------\n'));

    // Alineación izquierda (ESC a 0)
    commands.push(this.ESC, 0x61, 0);
    ticketData.items.forEach((item) => {
      const line = `${item.qty}x ${item.name.padEnd(18).substring(0, 18)} ${(item.qty * item.price).toFixed(2)}\n`;
      commands.push(...encoder.encode(line));
    });

    commands.push(...encoder.encode('--------------------------------\n'));
    // Alineación derecha para total (ESC a 2)
    commands.push(this.ESC, 0x61, 2);
    commands.push(...encoder.encode(`${t('tickets.total')}: ${(ticketData.total).toFixed(2)}\n\n`));

    // Pie de ticket
    commands.push(this.ESC, 0x61, 1);
    commands.push(...encoder.encode(`${ticketData.footer || t('tickets.receipt_thanks')}\n\n\n`));

    // Corte de papel (GS V 66 0)
    commands.push(this.GS, 0x56, 66, 0);

    return new Uint8Array(commands);
  }

  public static async printDirectUSB(buffer: Uint8Array): Promise<boolean> {
    try {
      if (!('usb' in navigator)) {
        console.warn('WebUSB API no está soportada en este navegador.');
        return false;
      }
      const device = await (navigator as any).usb.requestDevice({ filters: [] });
      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);
      await device.transferOut(1, buffer);
      await device.close();
      return true;
    } catch (err) {
      console.error('Error durante impresión WebUSB:', err);
      return false;
    }
  }
}
