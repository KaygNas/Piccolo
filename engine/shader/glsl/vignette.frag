#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;
layout(location = 0) in highp vec2 in_uv;
layout(location = 0) out highp vec4 out_color;

void main() {
    highp vec4 color = subpassLoad(in_color).rgba; // sRGB Space, each component in [0.0, 1.0]
    highp float len = length(in_uv - 0.5f);  // 距离点 (0.5, 0.5) 的距离
    highp float ratio = log2(len + 1.0f) * 2.0f;
    out_color = color * ratio;
}
