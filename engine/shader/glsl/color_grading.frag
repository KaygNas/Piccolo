#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D color_grading_lut_texture_sampler;

layout(location = 0) out highp vec4 out_color;

void main() {
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0);
    highp vec4 color = subpassLoad(in_color).rgba; // sRGB Space, each component in [0.0, 1.0]

    highp float _COLORS = float(lut_tex_size.y);
    highp float _MAX_COLORS = _COLORS - 1.0;
    highp float cell = color.b * _MAX_COLORS;
    highp float scale = _MAX_COLORS / _COLORS;
    highp float half_x = 0.5 / float(lut_tex_size.x);
    highp float half_y = 0.5 / float(lut_tex_size.y);
    highp float offset_r = half_x + color.r / _COLORS * scale;
    highp float offset_g = half_y + color.g * scale;

    // uv is an vec2, each components in [0.0, 1.0]
    highp vec2 lut_pos_l = vec2(floor(cell) / _COLORS + offset_r, offset_g);
    highp vec2 lut_pos_h = vec2(ceil(cell) / _COLORS + offset_r, offset_g);
    highp vec4 graded_color_l = texture(color_grading_lut_texture_sampler, lut_pos_l);
    highp vec4 graded_color_h = texture(color_grading_lut_texture_sampler, lut_pos_h);

    out_color = mix(graded_color_l, graded_color_h, fract(cell));
}
