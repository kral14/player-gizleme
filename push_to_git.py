import subprocess
import sys

def run_command(command):
    print(f"İcra edilir: {command}")
    result = subprocess.run(command, shell=True, text=True, capture_output=True)
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr)
    
    if result.returncode != 0:
        print(f"❌ Xəta baş verdi! Əmr: {command}")
        return False
    return True

def push_to_github():
    print("🚀 GitHub-a yüklənmə prosesi başlayır...\n")
    
    # 1. Mövcud remote yoxla, əgər varsa yenilə, yoxdursa əlavə et
    check_remote = subprocess.run("git remote -v", shell=True, text=True, capture_output=True)
    repo_url = "https://github.com/kral14/player-gizleme.git"
    
    if "origin" in check_remote.stdout:
        print("🔗 'origin' artıq mövcuddur, URL yenilənir...")
        run_command(f"git remote set-url origin {repo_url}")
    else:
        print("🔗 'origin' əlavə edilir...")
        run_command(f"git remote add origin {repo_url}")

    # 2. Budağı 'main' olaraq adlandır
    print("\n🌿 Budaq 'main' olaraq dəyişdirilir...")
    run_command("git branch -M main")
    
    # 3. Kodu göndər
    print("\n⬆️ Kodlar GitHub-a göndərilir...")
    print("⏳ Əgər autentifikasiya pəncərəsi açılarsa, GitHub hesabınızla daxil olun.")
    
    # Bu əmr istifadəçidən giriş tələb edə bilər (browser və ya pop-up ilə)
    success = run_command("git push -u origin main")
    
    if success:
        print("\n✅ TƏBRİKLƏR! Bütün kodlar uğurla GitHub-a yükləndi!")
        print(f"Layihənizə buraya klikləyərək baxa bilərsiniz: {repo_url[:-4]}")
    else:
        print("\n❌ Göndərmə zamanı problem yaşandı. Zəhmət olmasa yuxarıdakı xətaları yoxlayın.")

if __name__ == "__main__":
    push_to_github()
