if conda info --envs | grep -q stu-rec; then 
    echo "stu-rec already exists"
else
    conda create -y -n stu-rec
    conda shell.bash activate stu-rec
    conda install anaconda::psycopg2
    conda install anaconda::flask
    pip install -r requirements.txt
fi