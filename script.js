const glsl = x => x;
const vert = x => x;
const frag = x => x;

const vert_shader = vert`
    precision mediump float;
    attribute vec2 vertex_position;

    varying mediump vec2 coord;

    void main() {
        gl_Position = vec4(vertex_position.x, vertex_position.y, 0.0, 1.0);
        coord = vertex_position;
    }
`;

const frag_shader = frag`
    precision mediump float;

    varying mediump vec2 coord;

    uniform float u_period;
    uniform float u_height;

    const float APERTURE = 0.07;
    const float WIDTH = 0.01;

    float period = u_period - WIDTH * 50.0;

    const float RADIUS = 0.07;
    float circle_y = u_height;

    void main() {
        gl_FragColor = vec4(0.8, coord.y, coord.x, u_height * 0.4 + 0.7);

        if(abs(coord.y - (cos(coord.x * period)) * APERTURE - u_height) < WIDTH) {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }

        if(abs(coord.y + (cos(coord.x * period)) * APERTURE - u_height) < WIDTH) {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }

        float circle_field = (pow(coord.y - circle_y, 2.0) + pow(coord.x, 2.0));
        if(abs(pow(RADIUS, 2.0) - circle_field) < WIDTH * RADIUS * 2.0) {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    }
`;

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
  
    // Send the source to the shader object
  
    gl.shaderSource(shader, source);
  
    // Compile the shader program
  
    gl.compileShader(shader);
  
    // See if it compiled successfully
  
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
  
    return shader;
}

function draw(gl, shaderProgram, x) {
    gl.clearColor(0.0, 0.5, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const TRIANGLE_WIDTH = 0.8;
    const TRIANGLE_HEIGHT = 1.5;
    let EYE_HEIGHT = TRIANGLE_HEIGHT * x;

    const triangle_vertexes = new Float32Array([
        0.0, TRIANGLE_HEIGHT/2,
        TRIANGLE_WIDTH/2, -TRIANGLE_HEIGHT/2,
        -TRIANGLE_WIDTH/2, -TRIANGLE_HEIGHT/2
    ]);

    gl.useProgram(shaderProgram);

    const mason_period = Math.PI / (TRIANGLE_WIDTH * (1 - (EYE_HEIGHT / TRIANGLE_HEIGHT)));
    gl.uniform1f(gl.getUniformLocation(shaderProgram, 'u_period'), mason_period);
    
    const mason_height = -TRIANGLE_HEIGHT/2 + EYE_HEIGHT;
    gl.uniform1f(gl.getUniformLocation(shaderProgram, 'u_height'), mason_height);

    const triangle_vertexes_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangle_vertexes_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, triangle_vertexes, gl.STATIC_DRAW);

    const vertex_position = gl.getAttribLocation(shaderProgram, 'vertex_position');
    gl.vertexAttribPointer(vertex_position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertex_position);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

}
function main() {
    let canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let gl = canvas.getContext("webgl2");

    

    const shaderProgram = gl.createProgram();

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vert_shader);
    gl.attachShader(shaderProgram, vertexShader);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, frag_shader);
    gl.attachShader(shaderProgram, fragmentShader);

    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    let x = 0.5;
    let dir = 0.01;

    setInterval(() => {
        
        draw(gl, shaderProgram, x);
        
        x += dir;

        if(x > 0.9 || x < 0.05) {
            dir = -dir;
        }
    }, 10);

    
}

window.onload = main;