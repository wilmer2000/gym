import { inject, Injectable } from '@angular/core';
import { DateRange } from '../../../core/modules/form/components/range-date/range-date.component';
import { Measurement, MeasurementInput, Profile } from '../interfaces/profile';
import { MeasurementRepository } from '../repositories/measurement.repository';
import { ProfileRepository } from '../repositories/profile.repository';

// The single point components use to read and write profile data.
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly profiles = inject(ProfileRepository);
  private readonly measurements = inject(MeasurementRepository);

  readonly profileId = 1;

  getProfile(): Profile | null {
    return this.profiles.findById(String(this.profileId));
  }

  saveProfile(profile: Profile): void {
    if (this.profiles.exists(String(profile.id))) {
      this.profiles.update(profile);

      return;
    }

    this.profiles.create(profile);
  }

  listMeasurements(range?: DateRange): Measurement[] {
    return this.measurements.listByProfile(this.profileId, range);
  }

  saveMeasurement(input: MeasurementInput): void {
    this.measurements.upsert(input);
  }

  removeMeasurement(id: number): void {
    this.measurements.remove(String(id));
  }
}
