#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D color_grading_lut_texture_sampler;

layout(location = 0) out highp vec4 out_color;

highp float lerp(const highp float a, const highp float b, const highp float t) {
    return (1.0 - t) * a + t * b;
}

highp vec4 lerp(const highp vec4 a, const highp vec4 b, const highp float t) {
    return vec4(lerp(a.r, b.r, t), lerp(a.g, b.g, t), lerp(a.b, b.b, t), lerp(a.a, b.a, t));
}

highp vec4 to_rgba_in_percentage(const highp vec4 rgba) {
    highp float DENOMINATOR = 256.0;
    highp vec4 _rgba = vec4(rgba.r / DENOMINATOR, rgba.g / DENOMINATOR, rgba.b / DENOMINATOR, rgba.a / DENOMINATOR);
    return _rgba;
}

void main() {
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0);
    highp vec4 color = to_rgba_in_percentage(subpassLoad(in_color).rgba);

    highp int BLOCK_COUNT = lut_tex_size.x / lut_tex_size.y;
    highp float BLOCK_SIZE = float(lut_tex_size.y);
    highp float left_block_index = color.b * float(BLOCK_COUNT);

    highp float start_u = color.r * BLOCK_SIZE + floor(left_block_index) * BLOCK_SIZE;
    highp float start_v = color.g * BLOCK_SIZE;
    highp vec2 uv_1 = vec2(start_u, start_v);
    highp vec2 uv_2 = vec2(start_u + BLOCK_SIZE, start_v);
    highp vec4 color_1 = texture(color_grading_lut_texture_sampler, uv_1);
    highp vec4 color_2 = texture(color_grading_lut_texture_sampler, uv_2);
    highp float t = fract(left_block_index);

    out_color = lerp(color_1, color_2, t);
}
