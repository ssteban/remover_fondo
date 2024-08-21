from flask import Flask, render_template, request, jsonify
from rembg import remove
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)

@app.route("/")
def inicio():
    return render_template("index.html")

@app.route("/pagina", methods=['GET'])
def remover():
    return render_template("pagina/pagina.html")

@app.route("/procesar_imagen", methods=["POST"])
def procesar_imagen():
    data = request.get_json()
    image_data = data['image']

    image = Image.open(BytesIO(base64.b64decode(image_data)))

    # Remover el fondo
    image_no_bg = remove(image)

    buffered = BytesIO()
    image_no_bg.save(buffered, format="PNG")
    removed_bg_image_data = base64.b64encode(buffered.getvalue()).decode('utf-8')

    return jsonify({
        'original': 'data:image/png;base64,' + image_data,
        'procesada': 'data:image/png;base64,' + removed_bg_image_data
    })




if __name__ == '__main__':
    app.run(debug=True, port=5000)