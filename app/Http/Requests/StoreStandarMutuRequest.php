<?php

namespace App\Http\Requests;

use App\Models\StandarMutu;
use Illuminate\Foundation\Http\FormRequest;

class StoreStandarMutuRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', StandarMutu::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'kode' => 'required|string|unique:standar_mutu,kode',
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'status' => 'boolean',
        ];
    }
}
