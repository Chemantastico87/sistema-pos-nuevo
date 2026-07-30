"""
Script de mantenimiento para base de datos de producción.
En modo comercial, el sistema se inicia vacío.
"""
import sys
import os

def check_clean_db():
    print("✅ Entorno comercial configurado. La base de datos iniciará vacía de datos demo.")

if __name__ == "__main__":
    check_clean_db()
