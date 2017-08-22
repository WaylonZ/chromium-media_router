// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Stream capture parameters.
 */

goog.provide('mr.mirror.CaptureParameters');
goog.provide('mr.mirror.CaptureSurfaceType');

goog.require('mr.Assertions');
goog.require('mr.mirror.Config');


/**
 * Parameters that configure and control local media capture.
 */
mr.mirror.CaptureParameters = class {
  /**
   * @param {!mr.mirror.CaptureSurfaceType} captureSurface
   * @param {!mr.mirror.Settings} mirrorSettings
   * @param {string=} opt_offscreenTabUrl
   * @param {string=} opt_presentationId
   */
  constructor(
      captureSurface, mirrorSettings, opt_offscreenTabUrl, opt_presentationId) {
    if (opt_offscreenTabUrl) {
      mr.Assertions.assert(
          captureSurface == mr.mirror.CaptureSurfaceType.OFFSCREEN_TAB);
      mr.Assertions.assert(opt_presentationId);
    }

    /** @type {!mr.mirror.CaptureSurfaceType} */
    this.captureSurface = captureSurface;

    /** @type {!mr.mirror.Settings} */
    this.mirrorSettings = mirrorSettings;

    /** @type {?string} */
    this.offscreenTabUrl = opt_offscreenTabUrl || null;

    /** @type {?string} */
    this.presentationId = opt_presentationId || null;
  }

  /**
   * @return {boolean} True if this is for tab capture
   */
  isTab() {
    return this.captureSurface == mr.mirror.CaptureSurfaceType.TAB;
  }

  /**
   * @return {boolean} True if this is for desktop capture
   */
  isDesktop() {
    return this.captureSurface == mr.mirror.CaptureSurfaceType.DESKTOP;
  }

  /**
   * @return {boolean} True if this is for offscreen tab capture
   */
  isOffscreenTab() {
    return this.captureSurface == mr.mirror.CaptureSurfaceType.OFFSCREEN_TAB;
  }

  /**
   * @param {string=} opt_sourceId The source id of the desktop media.
   * @return {MediaConstraints} Media constraints for use with platform
   * capture APIs.
   */
  toMediaConstraints(opt_sourceId) {
    if (this.isTab()) {
      return this.toTabMediaConstraints_();
    } else if (this.isOffscreenTab()) {
      return this.toOffscreenTabMediaConstraints_();
    } else {
      return this.toDesktopMediaConstraints_(mr.Assertions.assertString(
          opt_sourceId, 'Missing desktop capture source id'));
    }
  }

  /**
   * @return {MediaConstraints} Media constraints for use with platform
   * capture APIs.
   * @private
   */
  toTabMediaConstraints_() {
    const constraints = /** @type {MediaConstraints} */
        ({
          'audio': this.mirrorSettings.shouldCaptureAudio,
          'video': this.mirrorSettings.shouldCaptureVideo
        });

    if (this.mirrorSettings.shouldCaptureVideo) {
      constraints['videoConstraints'] = {
        'mandatory': {'enableAutoThrottling': true}
      };
      this.setCommonVideoConstraints_(
          constraints['videoConstraints']['mandatory']);
    }
    return constraints;
  }

  /**
   * @return {MediaConstraints} Media constraints for use with offscreen
   * capture APIs.
   * @private
   */
  toOffscreenTabMediaConstraints_() {
    mr.Assertions.assert(
        this.presentationId, 'Missing offscreen capture presentation id');
    const constraints = this.toTabMediaConstraints_();
    constraints['presentationId'] = this.presentationId;
    return constraints;
  };

  /**
   * @param {string} sourceId The source id of the desktop media.
   * @return {MediaConstraints} Media constraints for use with platform
   * capture APIs.
   * @private
   */
  toDesktopMediaConstraints_(sourceId) {
    const constraints = /** @type {MediaStreamConstraints}  */
        ({'audio': false, 'video': false});

    if (this.mirrorSettings.shouldCaptureVideo) {
      constraints['video'] = {
        'mandatory': {
          'chromeMediaSource': 'desktop',
          'chromeMediaSourceId': sourceId,
        }
      };
      this.setCommonVideoConstraints_(constraints['video']['mandatory']);

    }

    if (mr.mirror.Config.isDesktopAudioCaptureAvailable &&
        this.mirrorSettings.shouldCaptureAudio) {
      constraints['audio'] = {
        'mandatory': {
          'chromeMediaSource': 'desktop',
          'chromeMediaSourceId': sourceId,
        }
      };
    }

    return constraints;
  }

  /**
   * Helper to populate common video constraints fields for both capture APIs.
   * @param {!Object} constraints
   * @private
   */
  setCommonVideoConstraints_(constraints) {
    // If sender-side letterboxing is being used, pass altered min dimensions to
    // the capture API which match the aspect ratio of the max dimensions. The
    // capture API will interpret this to mean that it must perform
    // letterboxing/pillarboxing.
    let minWidth = this.mirrorSettings.minWidth;
    let minHeight = this.mirrorSettings.minHeight;
    if (this.mirrorSettings.senderSideLetterboxing) {
      const altMin = this.mirrorSettings.getMinDimensionsToMatchAspectRatio();
      minWidth = altMin.width;
      minHeight = altMin.height;
    }

    Object.assign(constraints, {
      'minWidth': minWidth,
      'minHeight': minHeight,
      'maxWidth': this.mirrorSettings.maxWidth,
      'maxHeight': this.mirrorSettings.maxHeight,
      'minFrameRate': this.mirrorSettings.minFrameRate,
      'maxFrameRate': this.mirrorSettings.maxFrameRate,
    });
  }
};


/**
 * Possible capture modes.
 * @enum {string}
 */
mr.mirror.CaptureSurfaceType = {
  TAB: 'tab',
  DESKTOP: 'desktop',
  OFFSCREEN_TAB: 'offscreen_tab'
};
