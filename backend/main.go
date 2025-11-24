package main

import "golang.org/x/crypto/bcrypt"

func main() {
	hash, _ := bcrypt.GenerateFromPassword([]byte("12345"), bcrypt.DefaultCost)
	println(string(hash))
}
