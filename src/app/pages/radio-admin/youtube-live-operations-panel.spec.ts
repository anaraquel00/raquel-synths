import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  YoutubeOperationsService
} from '../../core/youtube-operations/youtube-operations.service';

import {
  YoutubeLiveOperationsPanelComponent
} from './youtube-live-operations-panel';

describe(
  'YoutubeLiveOperationsPanelComponent',
  () => {
    let fixture:
      ComponentFixture<YoutubeLiveOperationsPanelComponent>;

    beforeEach(
      async () => {
        await TestBed
          .configureTestingModule({
            imports: [
              YoutubeLiveOperationsPanelComponent
            ],
            providers: [
              {
                provide:
                  YoutubeOperationsService,
                useValue: {
                  disconnect:
                    () => undefined
                }
              }
            ]
          })
          .compileComponents();

        fixture =
          TestBed
            .createComponent(
              YoutubeLiveOperationsPanelComponent
            );
      }
    );

    it(
      'keeps the ingest secret outside the UI and exposes the Phase 4 lifecycle',
      () => {
        fixture
          .componentInstance
          .plan = {
            id:
              'live-plan',
            updateTime:
              '2026-11-04T20:00:00Z',
            kind:
              'monthly-radio',
            dryRunStatus:
              'PASS',
            title:
              'RQS RADIO // TEST',
            description:
              'Monthly test',
            scheduledStartTime:
              '2099-11-29T21:00:00.000Z',
            visibility:
              'private',
            playlistId:
              '',
            autoStart:
              false,
            autoStop:
              false
          };

        fixture.detectChanges();

        const text =
          fixture
            .nativeElement
            .textContent || '';

        expect(text)
          .toContain(
            'PHASE 4 // LIVE OPERATIONS'
          );

        expect(text)
          .toContain(
            'OBS → YouTube RTMPS'
          );

        expect(text)
          .toContain(
            'Stream key e ingest permanecem fora'
          );

        expect(text)
          .not
          .toContain(
            'COPY OBS SETTINGS'
          );
      }
    );
  }
);
