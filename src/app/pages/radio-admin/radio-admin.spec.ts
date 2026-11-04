import {
  PLATFORM_ID
} from '@angular/core';

import {
  TestBed
} from '@angular/core/testing';

import {
  provideRouter
} from '@angular/router';

import {
  RadioAdminComponent
} from './radio-admin';

describe(
  'RadioAdminComponent',
  () => {
    beforeEach(() => {
      TestBed
        .configureTestingModule({
          imports: [
            RadioAdminComponent
          ],

          providers: [
            provideRouter([]),
            {
              provide:
                PLATFORM_ID,
              useValue:
                'server'
            }
          ]
        });
    });

    it(
      'renders four independent media sessions while keeping Foundation read-only',
      () => {
        const fixture =
          TestBed.createComponent(
            RadioAdminComponent
          );

        fixture.detectChanges();

        const component =
          fixture.componentInstance;

        component
          .authenticated
          .set(true);

        fixture.detectChanges();

        const text =
          fixture
            .nativeElement
            .textContent || '';

        expect(text)
          .toContain(
            'Media Control Plane'
          );

        expect(text)
          .toContain(
            'Monthly Radio'
          );

        expect(text)
          .toContain(
            'Weekly Videos'
          );

        expect(text)
          .toContain(
            'Shorts'
          );

        expect(text)
          .toContain(
            'Special Streams'
          );

        expect(text)
          .toContain(
            'NO YOUTUBE WRITES'
          );

        expect(text)
          .toContain(
            'RUN RADIO DRY RUN'
          );

        expect(text)
          .not
          .toContain(
            'CREATE YOUTUBE LIVE'
          );

        expect(text)
          .not
          .toContain(
            'UPLOAD VIDEO'
          );
      }
    );

    it(
      'switches to the weekly video planner without enabling media upload',
      () => {
        const fixture =
          TestBed.createComponent(
            RadioAdminComponent
          );

        fixture.detectChanges();

        const component =
          fixture.componentInstance;

        component
          .authenticated
          .set(true);

        component
          .selectSection(
            'weekly-video'
          );

        fixture.detectChanges();

        const text =
          fixture
            .nativeElement
            .textContent || '';

        expect(text)
          .toContain(
            'Plan Weekly Video'
          );

        expect(text)
          .toContain(
            'RUN VIDEO PLAN'
          );

        expect(text)
          .toContain(
            'Upload do vídeo permanece manual'
          );
      }
    );
  }
);
