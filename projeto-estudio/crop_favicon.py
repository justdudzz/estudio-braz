from PIL import Image
import os

def crop_favicon(input_path, output_path):
    print(f"Processando {input_path}...")
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        
        # Encontrar o bounding box de píxeis não transparentes
        bbox = img.getbbox()
        
        if bbox:
            print(f"Encontrado bounding box: {bbox}")
            # Realizar o crop
            cropped_img = img.crop(bbox)
            
            # Opcional: Tornar quadrado se necessário (para favicons é melhor)
            # Mas o utilizador quer "o máximo maior", então vamos manter o aspecto
            # e deixar o browser lidar com o centro se for 16x16.
            
            cropped_img.save(output_path)
            print(f"Salvo em {output_path} com sucesso.")
        else:
            print("Erro: A imagem parece estar vazia ou totalmente transparente.")
            
    except Exception as e:
        print(f"Ocorreu um erro: {e}")

if __name__ == "__main__":
    public_dir = r"c:\Users\Edu\MyProject\projeto-estudio\public"
    input_file = os.path.join(public_dir, "faviconBraz3.png")
    output_file = os.path.join(public_dir, "faviconBraz4.png")
    
    crop_favicon(input_file, output_file)
