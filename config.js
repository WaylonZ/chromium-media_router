// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Configs.
 */

goog.provide('mr.Config');


/**
 * Compiler flag used to enable debug/testing only components.
 * @define {boolean} True if this extension was released through debug channel.
 */
mr.Config.isDebugChannel = false;


/**
 * Compiler flag used to set logging level and other privacy sensitive config
 * for public release.
 * @define {boolean} True if this extension was released through public channel.
 */
mr.Config.isPublicChannel = true;
