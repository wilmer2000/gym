import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ChangePin } from '../../../../login/components/change-pin/change-pin.component';
import { ModalService } from '../../../../modal/services/modal.service';
import { Section } from '../../../../../../shared/components/section/section.component';

@Component({
  selector: 'app-security-section',
  templateUrl: './security-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Section],
})
export class SecuritySection {
  private readonly modal = inject(ModalService);

  openChangePin(): void {
    this.modal.open({
      title: 'Cambiar PIN',
      subtitle: 'Primero validamos el PIN actual y después pedimos el nuevo.',
      type: 'info',
      buttons: { okButton: true, closeButton: true },
      component: ChangePin,
    });
  }
}
