import os
import urllib.request
import zipfile

def download_and_extract():
    url = "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip"
    dest_dir = "maven"
    zip_path = os.path.join(dest_dir, "maven.zip")
    
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
        
    print(f"Downloading Maven from {url}...")
    try:
        urllib.request.urlretrieve(url, zip_path)
        print("Download completed. Extracting zip...")
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(dest_dir)
            
        print("Extraction completed.")
        os.remove(zip_path)
        print("Temporary zip removed.")
        
        # Verify
        mvn_bin = os.path.join(dest_dir, "apache-maven-3.9.6", "bin", "mvn.cmd")
        if os.path.exists(mvn_bin):
            print(f"Maven available at: {mvn_bin}")
        else:
            print("Warning: mvn.cmd not found at expected location.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    download_and_extract()
