import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Input } from '../../../../core/modules/form/components/input/input.component';
import { TextArea } from '../../../../core/modules/form/components/text-area/text-area.component';
import { Toggle } from '../../../../core/modules/form/components/toggle/toggle.component';
import { Section } from '../../../../shared/components/section/section.component';

@Component({
  selector: 'app-plan-data-form',
  imports: [Input, TextArea, Toggle, FormsModule, Section],
  templateUrl: './plan-data-form.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanDataForm {
  readonly name = input.required<string>();
  readonly description = input.required<string>();
  readonly active = input.required<boolean>();

  readonly nameChange = output<string>();
  readonly descriptionChange = output<string>();
  readonly activeChange = output<boolean>();
}
